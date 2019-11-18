const { resEnum, createResponse } = require('../lib/utils');
const { restaurantLogin } = require('../services/restaurants');
/**
 * Middleware to check if user if logged in
 * If user is not logged in, respond with error (status 1000 = authentication error)
 */
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) return res.json(createJsonRes(resEnum.notAuthenticated));
  next();
};

const getCurrentUser = (req) => req.session.userId;
const login = (db, req, id) => {
  req.session.userId = id;
  restaurantLogin(db, req, id);
};

module.exports = { isAuthenticated, getCurrentUser, login };
