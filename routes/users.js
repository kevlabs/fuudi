/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { getCurrentUser, login, logout, resetUserCookies } = require('../services/users');

module.exports = (db) => {
  router.get('/', async function(req, res) {
    try {
      const users = await db.query(`SELECT * FROM users;`);
      res.json({ users });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  router.route('/login')
    // get user data if logged in
    .get(async (req, res) => {
      try {
        const user = getCurrentUser(req);
        if (!user) throw Error('User not logged in.');

        const userData = await login(db, req);
        res.json({ ...userData, isLoggedIn: true });

      } catch (err) {
        res.status(403).json({ error: err.message, isLoggedIn: false });
      }
    })
    // login user
    .post(async (req, res) => {
      try {
        if (!req.body.username || !req.body.password) throw Error('No credentials supplied');

        const userData = await login(db, req, req.body.username, req.body.password);
        res.json({ ...userData, isLoggedIn: true });

      } catch (err) {
        res.status(403).json({ error: err.message, isLoggedIn: false });
      }

    });

  // logout
  router.get('/logout', (req, res) => {
    logout(req);
    res.json({ isLoggedIn: false });
  });

  // temporary login route
  router.get('/:id', function(req, res) {
    const userId = getCurrentUser(req);
    if (!userId) resetUserCookies(db, req, req.params.id);
    res.send(`Logged in as ${req.session.userId}`);
  });

  return router;
};
