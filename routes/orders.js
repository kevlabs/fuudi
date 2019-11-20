/*
 * All routes for Orders are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const { createOrder, updateOrderStatus, completeOrder, getOrderData } = require('../services/orders');
const { stringToInteger, resEnum, createResponse, setWaitTime } = require('../lib/utils');
const { isAuthenticated, getCurrentUser } = require('../services/users');
const { isRestaurantOwner } = require('../services/restaurants');

module.exports = (db) => {
  // users should be authenticated to access this route
  router.use(isAuthenticated);

  router.route('/')
    // get all orders for a given client
    .get(async (req, res) => {
      try {
        const userId = getCurrentUser(req);
        const orders = await getOrderData(db, userId);
        res.json(orders);

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })

    // create order
    .post(async (req, res) => {
      try {
        const userId = getCurrentUser(req);
        const orderId = await createOrder(db, userId, req.body);
        const order = await getOrderData(db, userId, {
          'id': orderId
        });
        res.json(order);

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

  router.route('/:id')
    // get order details by order id
    .get(async (req, res) => {
      try {
        const userId = getCurrentUser(req);
        const order = await getOrderData(db, userId, {
          'id': req.params.id
        });
        res.json(order);

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    // update order (status)
    .put((req, res) => {

    });

  // get order by restaurant id - for restaurant owners only
  router.get('/restaurants/:id', async (req, res) => {
    try {
      const restaurantId = Number(req.params.id);
      if (!isRestaurantOwner(req, restaurantId)) return res.status(403).json({ error: 'unauthorized access' });

      const orders = await getOrderData(db, null, { restaurantId });
      res.json(orders);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

