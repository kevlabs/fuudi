const { stringToInteger } = require('../lib/utils');

const create = async(db, userId, store) => {
  let newStore = await query(`
  INSERT INTO resturants (owner_id, name, description, tags, photo_url, open_time, close_time, phone,
    email, street_address, city, post_code, latitude, longitude, wait_minutes, rating, rating_expires_at,
    is_active, is_deleted)
  VALUES (userId, req.body)
  `)
}