const { stringToInteger } = require('../lib/utils');

/*
Should be able to get orders by:
- restaurant_id
- user_id
- date

Sort by date

*/
const get = (db, options = {}) => {
  const filters = Object.keys(options);
  let filterString = filters.map((filter, i) => `$${i * 2 + 1} = $${i * 2 + 2}`).join(' AND ');
  filterString && (filterString = 'WHERE ' + filterString);
  const params = filters.reduce((params, filter) => params.concat([filter, options[filter]]), []);

  return db.query(`
    SELECT * FROM orders o
    JOIN order_menu_items o_m_i ON o.id = o_m_i.order_id
    JOIN menu_items m_i ON o_m_i.menu_item_id = m_i.id
    JOIN restaurants r ON m_i.restaurant_id = r.id
    ${filterString}
    ORDER BY o.created_at
  `, params);

};

/*
NEW ORDERS - JSON input format:
{
  "restaurantId": "1",
  "total": "1520",
  "items": [
    {
      "id": "1",
      "quantity": "4"
    },
    {
      "id": "7",
      "quantity": "1"
    },
    {
      "id": "27",
      "quantity": "1"
    }
  ]
}

*/

/**
 * Validate order input
 * @param {DB} db - Instance of the DB interface.
 * @param {any} order - Parsed order object to validate.
 * @return Valid order object. Raises an exception otherwise.
 */
const validateInput = (order) => {
  const output = {
    restaurantId: null,
    total: 0,
    items: []
  };

  // RestaurantId
  if (!order.restaurantId) throw Error('RestaurantId property is missing.');
  try {
    output.restaurantId = stringToInteger(order.restaurantId, (int) => int > 0, true);
  } catch (err) {
    throw Error('RestaurantId must be a positive integer.');
  }

  // Total
  if (!order.total) throw Error('Total property is missing.');
  try {
    output.total = stringToInteger(order.total, (int) => int > 0, true);
  } catch (err) {
    throw Error('Order total must be a positive integer.');
  }

  // Menu items
  if (!order.items || !Array.isArray(order.items) || !order.items.length) throw Error('Order must include one or more items.');
  order.items.forEach(item => {
    if (!item.id || !item.quantity) throw Error('All menu items must reference an id and a quantity.');
    try {
      output.items.push({
        id: stringToInteger(item.id, (int) => int > 0, true),
        quantity: stringToInteger(item.quantity, (int) => int > 0, true)
      });
    } catch (err) {
      throw Error('Item id and quantity must be positive integers.');
    }
  });

  return output;
};

/**
 * Create order
 * @param {DB} db - Instance of the DB interface.
 * @param {number} userId - Valid user id.
 * @param {any} order - Order object parsed from JSON - front-end input.
 * @return Promise resolving to the new order's id.
 */
const create = async (db, userId, order) => {
  try {
    const safeOrder = validateInput(order);
    const itemIds = safeOrder.items.map(item => item.id);

    return db.transaction(async (query) => {
      // #1 - validate menu items and get price
      const validItems = await query(`
        SELECT m_i.id, m_i.price_cents price
        FROM restaurants r
        JOIN menu_items m_i ON r.id = m_i.restaurant_id
        WHERE r.id = $1 AND r.is_deleted = FALSE AND r.is_active = TRUE AND m_i.id IN (${itemIds.map((_, i) => `$${i + 2}`).join(', ')}) AND m_i.is_active = TRUE
        FOR UPDATE;
      `, [safeOrder.restaurantId, ...itemIds]);

      if (validItems.length !== itemIds.length) throw Error('Mismatch between items ordered and items available for restaurant');

      // calculate order total
      // add price to items in safeOrder.items
      const orderTotal = validItems.reduce((total, { id, price }) => {
        const item = safeOrder.items.find(item => item.id === id);
        item.priceCents = price;
        return total + item.quantity * price;
      }, 0);
      // confirm that total matches total agreed to by customer
      if (orderTotal !== safeOrder.total) throw Error('Order total is inconsistent with item prices.');

      // #2 - create order record
      const bookedOrder = await query(`
        INSERT INTO orders (user_id, total_cents)
        VALUES ($1, $2)
        RETURNING id;
      `, [userId, orderTotal]);

      // get order id from newly created order
      const [{ id: orderId }] = bookedOrder;
      // params for menu items
      const itemParams = safeOrder.items.reduce((params, { id, quantity, priceCents }) => params.concat(orderId, id, quantity, priceCents), []);

      // #3 - insert menu items in order/items bridge table
      const bookedItems = await query(`
        INSERT INTO order_menu_items (order_id, menu_item_id, quantity, price_cents)
        VALUES ${safeOrder.items.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(', ')}
        RETURNING order_id;
      `, itemParams);

      // return new order id
      return bookedItems[0].order_id;
    });

  } catch (err) {
    // rethrow error so it can be caught in the transaction for all changes to be rolled back
    throw Error(`Order could not be created due to an error. Error: ${err.message}.`);
  }
};

/**
 * Update order status
 * Use complete() to mark order as complete
 * @param {DB} db - Instance of the DB interface.
 * @param {number} id - Order id.
 * @param {string} status - New status. Should be one of 'Pending', 'In Progress', 'Declined'.
 * @return Promise resolving to the updated order record from db.
 */
const updateStatus = (db, id, status) => {
  if (!['Pending', 'In Progress', 'Declined'].includes(status)) throw Error(`Order status ${status} is not valid.`);
  return db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
};

/**
 * Mark order as complete
 * @param {DB} db - Instance of the DB interface.
 * @param {number} id - Order id.
 * @return Promise resolving to the updated order record from db.
 */
const complete = (db, id) => {
  return db.query(`UPDATE orders SET fulfilled_at = NOW(), status = 'Completed' WHERE id = $1`, [id]);
};

module.exports = { get, create, updateStatus, complete };
