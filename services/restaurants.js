const { stringToInteger } = require('../lib/utils');

// check if user is owner of given restaurant by Id
const isRestaurantOwner = (req, restaurantId) => {
  return req.session.restaurantIds && req.session.restaurantIds.includes(restaurantId);
};

/*
OLD implementation
const isRestaurantOwner = async (db, restaurantId, userId) => {
  try {
    const data = await db.query(`
    SELECT * FROM restaurants r
    WHERE r.id = $1 AND r.owner_id = $2
    `, [restaurantId, userId]);
    return data.length === 1;

  } catch (err) {
    throw Error(`Could not confirm restaurant ownership. Error: ${err.message}`);
  }
};

*/

// restaurants I own
const getRestaurantsByOwner = (db, userId) => {
  try {
    return db.query(`
    SELECT * FROM restaurants r
    WHERE r.owner_id = $1
    `, [userId]);

  } catch (err) {
    throw Error(`Could not retrieve user's restaurants. Error: ${err.message}`);
  }
};

const restaurantLogin = (db, req, userId) => {
  const restaurants = getRestaurantsByOwner(db, userId);
  restaurants && (req.session.restaurantIds = restaurants);
};

const getOwnedRestaurants = (req) => req.session.restaurantIds;

const create = async(db, userId, store) => {
  let newStore = await query(`
  INSERT INTO resturants (owner_id, name, description, tags, photo_url, open_time, close_time, phone,
    email, street_address, city, post_code, latitude, longitude, wait_minutes, rating, rating_expires_at,
    is_active, is_deleted)
  VALUES (userId, req.body)
  `)
}

module.exports = { isRestaurantOwner, getRestaurantsByOwner, restaurantLogin, getOwnedRestaurants };
