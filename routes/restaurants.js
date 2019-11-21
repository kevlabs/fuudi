/*
 * All routes for Restaurants are defined here
 * Since this file is loaded in server.js into api/users,
 * these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { isAuthenticated, getCurrentUser} = require('../services/users');
const { getRestaurantData, createRestaurant, isRestaurantOwner } = require('../services/restaurants');


module.exports = (db) => {
  // users should be authenticated to access this route
  router.use(isAuthenticated);

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

  router.route('/:id')
    // get info for restaurant
    .get(async (req, res) => {
      try {
        const restaurantId = Number(req.params.id);
        // if (!isRestaurantOwner(req, restaurantId)) return res.status(403).json({ error: 'unauthorized access' });

        const restaurant = await getRestaurantData(db, {
          id: restaurantId
        });

        res.json(restaurant);

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })

  return router;
};
