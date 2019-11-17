/*
 * All routes for Orders are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { create: createOrder, updateStatus: updateOrderStatus, complete: completeOrder } = require('../services/orders');
const { isLoggedIn } = require('../services/users');

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
    .post(async (req, res) => {
      try {
        const userId = isLoggedIn(req);
        if (!userId) throw Error('User not logged in.');

        const order = createOrder(db, userId, req.body);
        console.log(order);

      } catch (err) {
        console.error(err.message);
      }

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

