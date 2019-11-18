/*
 * All routes for Orders are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { get: getOrder, create: createOrder, updateStatus: updateOrderStatus, complete: completeOrder, parse: parseOrder } = require('../services/orders');
const { stringToInteger, resEnum, createResponse } = require('../lib/utils');
const { isAuthenticated, getCurrentUser } = require('../services/users');
const { isRestaurantOwner, getRestaurantsByOwner} = require('../services/restaurants');

module.exports = (db) => {
  // users should be authenticated to access this route
  router.use(isAuthenticated);

  router.route('/')
    // get all orders for a given client or restaurant
    .get(async (req, res) => {
      try {
        const userId = getCurrentUser(req);
        let orderData;

        // if ownerRestaurantId field has a value pull all order for that restaurant
        const restaurantId = stringToInteger(req.body.ownerRestaurantId, (int) => int > 0, true);
        if (isRestaurantOwner(db, restaurantId, userId)) {
          orderData = await getOrder(db, null, { restaurantId });

        } else {
          orderData = await getOrder(db, userId);
        }

        const orders = parseOrder(orderData);

        res.json(createResponse(resEnum.success, orders));

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })

    // create order
    .post(async (req, res) => {
      try {
        const userId = getCurrentUser(req);

        console.log('Logged in as:', userId);
        console.log('Input data', req.body);

        const orderId = await createOrder(db, userId, req.body);
        console.log('Order successfully added', orderId);
        res.json(createResponse(resEnum.success, { orderId }));


      } catch (err) {
        console.error(err.message);
      }

    });

  router.route('/:id')
    // get order details by id
    .get(async (req, res) => {
      try {
        const userId = getCurrentUser(req);
        const orderData = await getOrder(db, userId, {
          'id': req.params.id
        });
        const order = parseOrder(orderData);

        res.json(createResponse(resEnum.success, order));

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    // update order (status)
    .put((req, res) => {

    });

  return router;
};

