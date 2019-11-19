/*
 * All routes for Restaurants are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { getCurrentUser} = require('../services/users');
const { getRestaurantData, createRestaurant } = require('../services/restaurants');


module.exports = (db) => {
  router.route('/')
    // get all restaurants
    .get(async (req, res) => {
      try {
        const restaurants = await getRestaurantData(db);
        res.json(restaurants);

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    // create restaurant
    .post(async (req, res) => {
      try {
        const userId = getCurrentUser(req);
        const restaurantId = await createRestaurant(db, userId, req.body);
        const restaurant = await getRestaurantData(db, {
          'id': restaurantId
        });
        res.json(restaurant);

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

  return router;
};
