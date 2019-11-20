const { stringToInteger, stringToDate, isTimestamp, isEmail, isUrl } = require('../lib/utils');
const getCoordinates = require('../lib/geo-coordinates');
const getYelpData = require('../lib/yelp-data');

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

const restaurantLogin = async (db, req, userId) => {
  try {
    const restaurants = await getRestaurantsByOwner(db, userId);
    restaurants && (req.session.restaurantIds = restaurants.map(data => data.id));
  } catch (err) {
    throw Error('Failed to get user\'s restaurants.');
  }
};

const getOwnedRestaurants = (req) => req.session.restaurantIds || [];

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
    SELECT r.id, r.name, r.description, r.photo_url, r.open_time, r.close_time, r,email, r.phone, r.street_address, r.city, r.post_code, r.latitude, r.longitude, r.wait_minutes, r.rating, r.rating_expires_at, m_i.id item_id, m_i.name item_name, m_i.description item_description, m_i.photo_url item_photo_url, m_i.price_cents item_price_cents
    FROM restaurants r
    JOIN menu_items m_i ON r.id = m_i.restaurant_id
    ${whereFilter}
  `, params);

};

// update rating - data from yelp
const updateRating = async (db, data) => {
  // filter by unique id
  const [unique, nonUnique] = data.reduce(([unique, nonUnique], row) => {
    (unique.length && unique[unique.length - 1].id || 0) !== row.id && unique.push(row) || nonUnique.push(row);
    return [unique, nonUnique];
  }, [[], []]);

  // update the first record for each row
  unique.forEach(async (row) => {
    const { id, name, latitude, longitude, rating, rating_expires_at: ratingExpiry } = row;
    try {
      const expiry = new Date(ratingExpiry);

      if (expiry < Date.now()) {
        let { rating: newRating } = await getYelpData(name, latitude, longitude);
        newRating = Number(newRating) * 100;
        const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const [ { rating: bookedRating, rating_expires_at: bookedExpiry }] = await db.query(`
          UPDATE restaurants SET rating = $1, rating_expires_at = $2
          WHERE id = $3
          RETURNING *
        `, [newRating, newExpiry, id]);

        row.rating = bookedRating;
        row.rating_expires_at = bookedExpiry;

      }

    } catch (err) {
      // set back to original values
      row.rating = rating;
      row.rating_expires_at = ratingExpiry;
    }

  });

  // update non-unique records
  nonUnique.forEach(row => {
    const updatedUnique = unique.find(updated => updated.id === row.id);
    row.rating = updatedUnique.rating;
    row.rating_expires_at = updatedUnique.rating_expires_at;
  });

  return data;

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
      email: row.email,
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
    let restaurantData = await get(db, options);
    restaurantData = await updateRating(db, restaurantData);
    return parse(restaurantData);

  } catch (err) {
    throw Error('Restaurant data could not be gathered');
  }
};

/*
NEW RESTAURANT - JSON input format:
{
    "name": "New super cool restaurant",
    "description": "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
    "tags": "hey",
    "photoUrl": "https://",
    "openTime": "08:13:14.000",
    "closeTime": "19:14:47.000",
    "phone": "+14169999999",
    "email": "john.doe@cool.com",
    "streetAddress": "90 Atwood Drive",
    "city": "Toronto",
    "postCode": "M5V1B7",
    "waitMinutes": 24,
    "items": [
        {
            "name": "Libri",
            "description": "Ratufa indica",
            "photoUrl": "https://",
            "priceCents": 871
        },
        {
            "name": "Hussey",
            "description": "Corvus albicollis",
            "photoUrl": "https://",
            "priceCents": 423
        }
    ]
}

*/

/**
 * Validate order input
 * @param {DB} db - Instance of the DB interface.
 * @param {any} restaurant - Parsed order object to validate.
 * @return Valid order object. Raises an exception otherwise.
 */
const validateInput = (restaurant) => {
  const output = {
    ownerId: restaurant.userId,
    items: []
  };

  // string fields
  ['name', 'description', 'tags', 'phone', 'streetAddress', 'city', 'postCode'].forEach(key => {
    const value = restaurant[key];
    if (!value || typeof value !== 'string') throw Error(`${key} is missing or not of type string.`);
    output[key] = value;
  });

  // timestamp fields
  ['openTime', 'closeTime'].forEach(key => {
    const value = restaurant[key];
    if (!value || !isTimestamp(value)) throw Error(`${key} is missing or not of type timestamp.`);
    output[key] = value;
  });

  // photoUrl
  if (!restaurant.photoUrl || !isUrl(restaurant.photoUrl)) throw Error('photoUrl is missing or not of type URL.');
  output.photoUrl = restaurant.photoUrl;

  // email
  if (!restaurant.email || !isEmail(restaurant.email)) throw Error('email is missing or not of type email.');
  output.email = restaurant.email;

  // WaitMinutes
  try {
    output.waitMinutes = stringToInteger(restaurant.waitMinutes, (int) => int > 0, true);
  } catch (err) {
    throw Error('waitMinutes must be a positive integer.');
  }

  // number fields
  // ['latitude', 'longitude'].forEach(key => {
  //   const value = Number(restaurant[key]);
  //   if (!value) throw Error(`${key} is missing or not of type number.`);
  //   output[key] = value;
  // });

  // Menu items
  if (!restaurant.items || !Array.isArray(restaurant.items) || !restaurant.items.length) throw Error('Restaurant must include one or more menu items.');
  restaurant.items.forEach(item => {
    if (!item.name || !item.description || !item.photoUrl || !item.priceCents) throw Error('Menu items must have properties name, description, photoURL and priceCents.');
    try {
      let isErr = '';
      output.items.push({
        name: typeof item.name === 'string' && item.name || (isErr = 'name'),
        description: typeof item.description === 'string' && item.description || (isErr = 'description'),
        photoUrl: typeof item.photoUrl === 'string' && item.photoUrl || (isErr = 'photoUrl'),
        priceCents: stringToInteger(item.priceCents, (int) => int > 0, true)
      });
      if (isErr) throw Error(isErr);
    } catch (err) {
      throw Error(`Menu item: ${item.name} ${err.message ? `(${err.message}) ` : ''}failed validation.`);
    }
  });

  return output;
};

/**
 * Create restaurant
 * @param {DB} db - Instance of the DB interface.
 * @param {number} userId - Valid user id (owner_id).
 * @param {any} restaurant - Order object parsed from JSON - front-end input.
 * @return Promise resolving to the new restaurant's id.
 */
const create = async (db, userId, restaurant) => {
  try {

    // temporarily add dummy latitude, longitude and rating
    // restaurant.latitude = 43.6441789;
    // restaurant.longitude = -79.4043927;
    // restaurant.rating = 300;

    const safeOrder = validateInput({ userId, ...restaurant });

    // get geo coordinates
    const { latitude, longitude } = await getCoordinates(safeOrder.postCode);
    safeOrder.latitude = latitude;
    safeOrder.longitude = longitude;

    const restaurantFields = ['ownerId', 'name', 'description', 'tags', 'photoUrl', 'openTime', 'closeTime', 'phone', 'email', 'streetAddress', 'city', 'postCode', 'latitude', 'longitude', 'waitMinutes'].map(field => safeOrder[field]);

    // don't catch errors in transaction or changes won't be rolled back
    return db.transaction(async (query) => {
      // #1 - create restaurant record
      const bookedRestaurant = await query(`
        INSERT INTO restaurants (owner_id, name, description, tags, photo_url, open_time, close_time, phone, email, street_address, city, post_code, latitude, longitude, wait_minutes)
        VALUES (${restaurantFields.map((_, i) => `$${i + 1}`).join(', ')})
        RETURNING id;
      `, restaurantFields);

      // get restaurant id from newly created restaurant
      const [{ id: restaurantId }] = bookedRestaurant;
      // params for menu items
      const itemParams = safeOrder.items.reduce((params, { name, description, photoUrl, priceCents }) => params.concat(restaurantId, name, description, photoUrl, priceCents), []);

      // #2 - insert menu items in menu_items table
      const bookedItems = await query(`
        INSERT INTO menu_items (restaurant_id, name, description, photo_url, price_cents)
        VALUES ${safeOrder.items.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(', ')}
        RETURNING restaurant_id;
      `, itemParams);

      // return new restaurant id
      return bookedItems[0].restaurant_id;
    });

  } catch (err) {
    throw Error(`Restaurant could not be created due to an error. Error: ${err.message}.`);
  }
};

module.exports = { isRestaurantOwner, getRestaurantsByOwner, restaurantLogin, getOwnedRestaurants, getRestaurant : get, parseRestaurant: parse, getRestaurantData: getData, createRestaurant: create };
