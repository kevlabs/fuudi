/*
 * All routes for Orders are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.route('/')
    // get all orders for a given client or restaurant
    .get(async (req, res) => {
      try {
        const orders = await db.query(`SELECT * FROM orders;`);
        res.json({ orders });

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })

    // create order
    .post((req, res) => {

    });

  router.route('/:id')
    // get order details by id
    .get(async (req, res) => {
      try {
        const orders = await db.query(`SELECT * FROM orders WHERE id = $1;`, [Number(req.params.id)]);
        res.json({ orders });

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    // update order (status)
    .put((req, res) => {

    });

  return router;
};

