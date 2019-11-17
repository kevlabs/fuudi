const { stringToInteger } = require('../lib/validate');

/*
NEW ORDERS - JSON input format:
{
  "restaurantId": "1",
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
    items: []
  };

  // RestaurantId
  if (!order.restaurantId) throw Error('RestaurantId property is missing.');
  try {
    output.restaurantId = stringToInteger(order.restaurantId, (int) => int > 0, true);
  } catch (err) {
    throw Error('RestaurantId must be positive integer.');
  }

  // Menu items
  if (!order.items || !Array.isArray(order.items) || !order.items.length) throw Error('Order must include items.');
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
 * @param {any} order - Order object parsed from JSON - front-end input.
 * @return Promise resolving to the new order's id.
 */
const create = async (db, userId, order) => {
  try {
    const safeOrder = validateInput(order);
    const menuItems = safeOrder.items.map(item => item.id);

    return db.transaction([

      // #1 - validate menu items and get price
      [
        `SELECT m_i.id, m_i.price_cents price
        FROM restaurants r
        JOIN menu_items m_i ON r.id = m_i.restaurant_id
        WHERE r.id = $1 AND m_i.id IN (${menuItems.map((_, i) => `$${i + 2}`).join(', ')}) AND m_i.is_active = TRUE;`,
        [safeOrder.restaurantId, ...menuItems]
      ],

      // #2 - create order record
      [
        `INSERT INTO orders (user_id, total_cents)
        VALUES ($1, $2)
        RETURNING id;`,
        (rows) => {
          // log previous query results
          console.log('Result - trans 1:', rows);

          // check result from prior query
          if (rows.length !== menuItems.length) throw Error('Mismatch between items ordered and items available for restaurant');

          // if no error return array of params for current query

          // calculate order total
          // add price to items in safeOrder.items
          const total = rows.reduce((total, { id, price }) => {
            const item = safeOrder.items.find(item => item.id === id);
            item.priceCents = price;
            return total + item.quantity * price;
          }, 0);

          return [userId, total];
        }
      ],

      // #3 - insert menu items in order/items bridge table
      [
        `INSERT INTO order_menu_items (order_id, menu_item_id, quantity, price_cents)
        VALUES ${safeOrder.items.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(', ')}
        RETURNING order_id;`,
        (rows) => {
          // log previous query results
          console.log('Result - trans 2:', rows);

          // get order id from newly created order
          const orderId = rows[0].id;
          // params for menu items
          return safeOrder.items.reduce((params, { id, quantity, priceCents }) => params.concat(orderId, id, quantity, priceCents), []);
        }
      ],

      // #4 - return new order
      [
        `SELECT * FROM orders WHERE id = $1;`,
        (rows) => [rows[0].order_id]
      ]

    ]);

  } catch (err) {
    throw Error(`Order could not be created due to an error. Error: ${err.message}`);
  }
};

/**
 * Update order status
 * Use complete() to mark order as complete
 * @param {DB} db - Instance of the DB interface.
 * @param {number} id - Order id.
 * @param {string} status - New status. Should be one of 'Pending', 'Confirmed', 'In Progress', 'Declined'.
 * @return Promise resolving to the updated order record from db.
 */
const updateStatus = (db, id, status) => {
  if (!['Pending', 'Confirmed', 'In Progress', 'Declined'].includes(status)) throw Error(`Order status ${status} is not valid.`);
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

module.exports = { create, updateStatus, complete };
