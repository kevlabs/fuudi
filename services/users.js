const bcrypt = require('bcrypt');
const { isEmail, isUsername } = require('../lib/utils');
const { restaurantLogin, getOwnedRestaurants } = require('./restaurants');
/**
 * Middleware to check if user if logged in
 * If user is not logged in, respond with error (status 1000 = authentication error)
 */
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) return res.status(403).json({ error: 'not authorized' });
  next();
};

const getCurrentUser = (req) => req.session.userId;

const resetUserCookies = async (db, req, userId) => {
  req.session.userId = userId;
  await restaurantLogin(db, req, userId);
};

const parseUser = ({ username, email, phone, restaurants }) => {
  return { username, email, phone, restaurants };
};

const login = async (db, req, username, password, id) => {
  try {

    let userId = req.session.userId || id;
    let user;

    if (!userId) {
      // proceed with authentication
      user = await db.query(`
      SELECT * FROM users
      WHERE username = $1;
      `, [username]);

      if (user.length !== 1 || !bcrypt.compareSync(password, user[0].password)) throw Error('Incorrect credentials');

      userId = user[0].id;

    } else {
      user = await db.query(`
      SELECT * FROM users
      WHERE id = $1 LIMIT 1;
      `, [userId]);
    }

    await resetUserCookies(db, req, userId);

    return parseUser({ ...user[0], restaurants: getOwnedRestaurants(req) });

  } catch (err) {
    throw Error(`Failled to log in. ${err.message}`);
  }
};

const logout = (req) => {
  req.session.userId && delete req.session.userId;
  req.session.restaurantIds && delete req.session.restaurantIds;
};

const validateInput = (options) => {
  const { username, email, phone, password } = options;

  if (!username || !isUsername(username)) throw Error('Username is empty or contains invalid characters. Valid characters: a-z, A-Z, 0-9, _, !, @, #, $, %, ^, &, *, -, +, [, ], {, }, |, \\, ", \', :, ;, ?, /, ,, <, ., >, and ..');
  if (!email || !isEmail(email)) throw Error('Email is missing or invalid.');
  if (!phone || typeof phone !== 'string') throw Error('Phone is missing.');
  if (!password || typeof password !== 'string') throw Error('Password is missing.');

  return { username, email, phone, password };

};

// returns new user id
const create = async (db, user) => {
  try {
    // data validation
    const safeUser = validateInput(user);
    const { username, email, phone, password } = safeUser;

    // don't catch errors in transaction or changes won't be rolled back
    return db.transaction(async (query) => {
      // #1 - inject user into table
      const bookedUser = await query(`
        INSERT INTO users (username, email, phone, password)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `, [username, email, phone, bcrypt.hashSync(password, 10)]);

      // get restaurant id from newly created user
      const [{ id: userId, username: bookedUsername }] = bookedUser;

      // #2 - make sure that username is unique or rollback
      const isUnique = await query(`
        SELECT * FROM users WHERE username = $1;
      `, [bookedUsername]);

      if (isUnique.length !== 1) throw Error('Username is not unique');

      // return new user
      return userId;
    });

  } catch (err) {
    throw Error(`User could not be created due to an error. Error: ${err.message}.`);
  }

};


module.exports = { isAuthenticated, getCurrentUser, login, logout, createUser: create };
