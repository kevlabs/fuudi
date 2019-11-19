const bcrypt = require('bcrypt');
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

const login = async (db, req, username, password) => {
  try {

    let userId = req.session.userId;
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


module.exports = { isAuthenticated, getCurrentUser, login, logout };
