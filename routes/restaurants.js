/*
 * All routes for Restaurants are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

 const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get('/', async function(req, res) {
    try {
      const restaurants = await db.query(`SELECT * FROM restaurants;`);
      res.json({ restaurants });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
};
