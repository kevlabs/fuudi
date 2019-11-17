const { resEnum, createResponse } = require('../lib/utils');
/**
 * Middleware to check if user if logged in
 * If user is not logged in, respond with error (status 1000 = authentication error)
 */
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) return res.json(createJsonRes(resEnum.notAuthenticated));
  next();
};

const getCurrentUser = (req) => req.session.userId;
const login = (req, id) => req.session.userId = id;

module.exports = { isAuthenticated, getCurrentUser, login };
