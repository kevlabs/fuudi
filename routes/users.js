/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { isLoggedIn, login } = require('../services/users');

module.exports = (db) => {
  router.get('/', async function(req, res) {
    try {
      const users = await db.query(`SELECT * FROM users;`);
      res.json({ users });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', function(req, res) {
    const userId = isLoggedIn(req);
    if (!userId) login(req, req.params.id);
    res.send(`Logged in as ${req.session.userId}`);
  });

  return router;
};
