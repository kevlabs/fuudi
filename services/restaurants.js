const { stringToInteger, stringToDate } = require('../lib/utils');

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

/*
Should be able to get restaurants by:
- id
- owner_id
- name
- tags
- minLatitude/maxLatitude
- minLongitude/maxLatitude
- minRating/maxRating

Sort by distance

Mapping
  id => r.id
  owner => r.owner_id
  name => r.name
  tags => r.tags

*/

/**
 * Set where filters for get order request
 * @param {any} options - Object with keys set to filters and values to filter by.
 * @return Tuple [where string, params[]].
 */
const setGetFilters = (options) => {
  const filters = ['r.is_active = true', 'r.is_deleted = false'];
  const params = [];

  if (options.id) {
    const id = stringToInteger(options.id, (int) => int > 0, true);
    params.push(id);
    filters.push(`r.id = $${params.length}`);
  }

  // input from back-end - no need to sanitize
  if (options.ownerId) {
    params.push(options.ownerId);
    filters.push(`r.owner_id = $${params.length}`);
  }

  if (options.name) {
    if (typeof options.name !== 'string') throw Error('Restaurant name should be a string.');
    params.push(`%${options.name}%`);
    filters.push(`r.name ILIKE $${params.length}`);
  }

  if (options.tags) {
    if (typeof options.tags !== 'string') throw Error('Tags should be a string.');
    params.push(`%${options.tags}%`);
    filters.push(`r.tags ILIKE $${params.length}`);
  }

  if (options.minLatitude && options.maxLatitude) {
    const minLatitude = Number(options.minLatitude);
    const maxLatitude = Number(options.maxLatitude);
    if (!minLatitude || !maxLatitude || minLatitude >= maxLatitude) throw Error('Min and max latitudes do not evaluate to numbers or min >= max.');

    params.push(minLatitude, maxLatitude);
    filters.push(`r.latitude BETWEEN $${params.length - 1} AND $${params.length}`);
  }

  if (options.minLongitude && options.maxLongitude) {
    const minLongitude = Number(options.minLongitude);
    const maxLongitude = Number(options.maxLongitude);
    if (!minLongitude || !maxLongitude || minLongitude >= maxLongitude) throw Error('Min and max longitudes do not evaluate to numbers or min >= max.');

    params.push(minLongitude, maxLongitude);
    filters.push(`r.longitude BETWEEN $${params.length - 1} AND $${params.length}`);
  }

  // rating is 100 * displayed rating
  if (options.rating) {
    const rating = stringToInteger(options.rating, (int) => int > 0, true);
    if (!rating || rating < 0) throw Error('Rating does not evaluate to a number or rating < 0.');
    params.push(`%${rating}%`);
    filters.push(`r.rating >= $${params.length}`);
  }

  const whereFilter = filters.length && `WHERE ${filters.join(' AND ')}` || '';
  return [whereFilter, params];
};

/**
 * Get order details
 * @param {DB} db - Instance of the DB interface.
 * @param {number} userId - Valid user id.
 * @param {any} options - Object with keys set to filters and values to filter by.
 * @return Promise resolving to the query resuls.
 */
const get = (db, options = {}) => {

  const [whereFilter, params] = setGetFilters(options);

  return db.query(`
    SELECT r.id, r.name, r.description, r.photo_url, r.open_time, r.close_time, r.phone, r.street_address, r.city, r.post_code, r.latitude, r.longitude, r.wait_minutes, r.rating, m_i.id item_id, m_i.name item_name, m_i.description item_description, m_i.photo_url item_photo_url, m_i.price_cents item_price_cents
    FROM restaurants r
    JOIN menu_items m_i ON r.id = m_i.restaurant_id
    ${whereFilter}
  `, params);

};


const parse = (data) => {
  const [sortedKeys, restaurants] = data.reduce(([sortedKeys, restaurants], row) => {
    sortedKeys[sortedKeys.length && sortedKeys.length - 1 || 0] !== row.id && sortedKeys.push(row.id);

    restaurants[row.id] = restaurants[row.id] || {
      id: row.id,
      name: row.name,
      description: row.description,
      photoUrl: row.photo_url,
      openTime: row.open_time,
      closeTime: row.close_time,
      phone: row.phone,
      streetAddress: row.street_address,
      city: row.city,
      postCode: row.post_code,
      latitude: row.latitude,
      longitude: row.longitude,
      waitMinutes: row.wait_minutes,
      rating: row.rating,
      items: []
    };

    restaurants[row.id].items.push({
      id: row.item_id,
      name: row.item_name,
      description: row.item_description,
      photoUrl: row.item_photo_url,
      priceCents: row.item_price_cents
    });

    return [sortedKeys, restaurants];
  }, [[], {}]);

  return sortedKeys.map(key => restaurants[key]);
};

const getData = async (db, options = {}) => {
  try {
    const restaurantData = await get(db, options);
    return parse(restaurantData);

  } catch (err) {
    throw Error('Restaurant data could not be gathered');
  }
};












// const create = async(db, userId, store) => {
//   let newStore = await query(`
//   INSERT INTO resturants (owner_id, name, description, tags, photo_url, open_time, close_time, phone,
//     email, street_address, city, post_code, latitude, longitude, wait_minutes, rating, rating_expires_at,
//     is_active, is_deleted)
//   VALUES (userId, req.body)
//   `)
// }

module.exports = { isRestaurantOwner, getRestaurantsByOwner, restaurantLogin, getOwnedRestaurants, getRestaurant : get, parseRestaurant: parse, getRestaurantData: getData };
