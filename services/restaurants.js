// check if user is owner of given restaurant by Id
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

module.exports = { isRestaurantOwner, getRestaurantsByOwner };
