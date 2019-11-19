const bcrypt = require('bcrypt');
const { restaurantLogin } = require('../services/restaurants');
/**
 * Middleware to check if user if logged in
 * If user is not logged in, respond with error (status 1000 = authentication error)
 */
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) return res.status(403).json({ error: 'not authorized' });
  next();
};

const getCurrentUser = (req) => req.session.userId;

const resetUserCookies = (db, req, userId) => {
  req.session.userId = userId;
  restaurantLogin(db, req, userId);
};

const parseUser = ([{ username, email, phone }]) => {
  return { username, email, phone };
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

      if (!user.length || !bcrypt.compareSync(password, user[0].password)) throw Error('Incorrect credentials');

      userId = user[0].id;

    } else {
      user = await db.query(`
      SELECT * FROM users
      WHERE id = $1;
      `, [userId]);
    }

    resetUserCookies(db, req, userId);
    return parseUser(user);

  } catch (err) {
    throw Error(`Failled to log in. ${err.message}`);
  }
};


module.exports = { isAuthenticated, getCurrentUser, login };
