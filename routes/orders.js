/*
 * All routes for Orders are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { get: getOrder, create: createOrder, updateStatus: updateOrderStatus, complete: completeOrder } = require('../services/orders');
const { resEnum, createResponse } = require('../lib/utils');
const { isAuthenticated, getCurrentUser } = require('../services/users');

module.exports = (db) => {
  // users should be authenticated to access this route
  router.use(isAuthenticated);

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

        console.log('Logged in as:', userId);

        // const order = await getOrder(db, {
        //   'user_id': userId,
        //   'order_id': req.params.id
        // });
        const order = await getOrder(db);

        console.log(order);


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

