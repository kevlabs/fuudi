const { stringToInteger, stringToDate } = require('../lib/utils');

/*
Should be able to get orders by:
- restaurant_id
- user_id -> will be passed to function from back-end as sensitive info
- maxDate/minDate -> will need to do between date and date+1

Sort by date

Mapping
  id => o.id
  restaurantId => r.id
  userId => o.user_id
  date => o.created_at

*/

/**
 * Set where filters for get order request
 * @param {any} options - Object with keys set to filters and values to filter by.
 * @return Tuple [where string, params[]].
 */
const setGetFilters = (options) => {
  const filters = [];
  const params = [];

  if (options.id) {
    const id = stringToInteger(options.id, (int) => int > 0, true);
    params.push(id);
    filters.push(`o.id = $${params.length}`);
  }

  if (options.userId) {
    params.push(options.userId);
    filters.push(`o.user_id = $${params.length}`);
  }

  if (options.restaurantId) {
    const id = stringToInteger(options.restaurantId, (int) => int > 0, true);
    params.push(id);
    filters.push(`r.id = $${params.length}`);
  }

  if (options.minDate || options.maxDate) {
    const minDate = options.minDate && stringToDate(options.minDate) || stringToDate(options.maxDate);
    const maxDate = (options.maxDate && stringToDate(options.maxDate) || minDate).setHours(23, 59, 59, 999);
    params.push(minDate, maxDate);
    filters.push(`o.created_at BETWEEN $${params.length - 1} AND $${params.length}`);
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
const get = (db, userId = null, options = {}) => {

  const [whereFilter, params] = setGetFilters({ userId, ...options });

  return db.query(`
    SELECT o.id, o.status, o.created_at, o.fulfilled_at, o.wait_minutes, o.total_cents, r.id restaurant_id, r.name restaurant_name, r.wait_minutes restaurant_wait_minutes, m_i.id item_id, m_i.name item_name, o_m_i.price_cents item_price_cents, o_m_i.quantity item_quantity, o_m_i.price_cents * o_m_i.quantity item_total
    FROM orders o
    JOIN order_menu_items o_m_i ON o.id = o_m_i.order_id
    JOIN menu_items m_i ON o_m_i.menu_item_id = m_i.id
    JOIN restaurants r ON m_i.restaurant_id = r.id
    ${whereFilter}
    ORDER BY o.created_at
  `, params);

};

/*
parse order query data into a JS object
public flag should be set to true if meant to be sent to front-end

Format:
[
  '1': {
    id: 1,
    status: 'pending',
    created_at: 123123123,
    fulfilled_at: 324465476,
    waitMinutes: 30,
    totalCents: 1200
    restaurant: {
      id: 1,
      name: 'wewewe'
    }
    items: [
      {
        id: 12,
        name: 'dwdsd',
        priceCents: 120,
        quantity: 10,
        totalCents: 1200
      }
    ]
  }
]

*/
const parse = (data) => {
  const [sortedKeys, orders] = data.reduce(([sortedKeys, orders], row) => {
    sortedKeys[sortedKeys.length && sortedKeys.length - 1 || 0] !== row.id && sortedKeys.push(row.id);

    orders[row.id] = orders[row.id] || {
      id: row.id,
      status: row.status,
      created: new Date(row.created_at),
      fulfilled: row.fulfilled_at && new Date(row.fulfilled_at) || null,
      waitMinutes: row.wait_minutes || row.restaurant_wait_minutes,
      totalCents: row.total_cents,
      restaurant: {
        id: row.restaurant_id,
        name: row.restaurant_name
      },
      items: []
    };

    orders[row.id].items.push({
      id: row.item_id,
      name: row.item_name,
      priceCents: row.item_price_cents,
      quantity: row.item_quantity,
      totalCents: row.item_total
    });

    return [sortedKeys, orders];
  }, [[], {}]);

  return sortedKeys.map(key => orders[key]);
};

const getData = async (db, userId = null, options = {}) => {
  try {
    const orderData = await get(db, userId, options);
    return parse(orderData);

  } catch (err) {
    throw Error('Order data could not be gathered');
  }
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
 * Validate order input - new order and updates.
 * @param {DB} db - Instance of the DB interface.
 * @param {any} order - Parsed order object to validate.
 * @param {boolean} [isUpdate=false] - Are we validating data for an updated order. If so, some fields are optional.
 * @return Valid order object. Raises an exception otherwise.
 */
const validateInput = (order, isUpdate = false) => {
  const output = {};

  // order id - mandatory for updates
  if (isUpdate) {
    if (!order.id) throw Error('Order id property is missing.');
    try {
      output.id = stringToInteger(order.id, (int) => int > 0, true);
    } catch (err) {
      throw Error('Order id must be a positive integer.');
    }
  }

  // RestaurantId - optional for updates
  if (!isUpdate || order.restaurantId) {
    if (!order.restaurantId) throw Error('RestaurantId property is missing.');

    try {
      output.restaurantId = stringToInteger(order.restaurantId, (int) => int > 0, true);
    } catch (err) {
      throw Error('RestaurantId must be a positive integer.');
    }
  }

  // Total - optional for updates
  if (!isUpdate || order.total) {
    if (!order.total) throw Error('Total property is missing.');

    try {
      output.total = stringToInteger(order.total, (int) => int > 0, true);
    } catch (err) {
      throw Error('Order total must be a positive integer.');
    }
  }

  // Status updates - for updates only
  if (isUpdate && order.status) {
    if (!['Pending', 'In Progress', 'Completed', 'Declined'].includes(order.status)) throw Error('Order status must be one of "Pending", "In Progress", "Completed" or "Declined".');

    output.status = order.status;
  }

  // waitMinutes - optional
  if (order.waitMinutes) {
    try {
      output.waitMinutes = stringToInteger(order.waitMinutes, (int) => int > 0, true);
    } catch (err) {
      throw Error('Order wait times must be a positive integer.');
    }
  }

  // Menu items - optional for updates (if specified, items must include an id)
  if (!isUpdate || order.items) {
    output.items = [];
    if (!order.items || !Array.isArray(order.items) || !order.items.length) throw Error(`Order items must be an array${!isUpdate && ' of one or more items' || ''}.`);

    order.items.forEach(item => {
      if (!item.id) throw Error('All menu items must reference an id.');
      if (!isUpdate && !item.quantity) throw Error('All menu items must reference a quantity.');
      try {
        const quantity = item.quantity && stringToInteger(item.quantity, (int) => int > 0, true);
        const action = item.action && ['add', 'remove', 'update'].includes(item.action) || 'update';

        output.items.push({
          id: stringToInteger(item.id, (int) => int > 0, true),
          quantity,
          action
        });

      } catch (err) {
        throw Error('Item id and quantity must be positive integers.');
      }
    });
  }

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

    // don't catch errors in transaction or changes won't be rolled back
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
    throw Error(`Order could not be created due to an error. Error: ${err.message}.`);
  }
};


/**
 * Update existing order
 * @param {DB} db - Instance of the DB interface.
 * @param {any} order - Order object parsed from JSON - front-end input.
 * @return Promise resolving to the new order's id.
 */
const update = async (db, userId = null, order) => {
  try {
    const safeOrder = validateInput(order, true);

    // item fields should not be updated for orders BUT keep logic for restaurant menu
    // const [addItems, updateItems] = safeOrder.items && safeOrder.items.reduce(([add, update], item) => {
    //   item.action === 'add' && add.push(item) || update.push(item);
    //   return [add, update];
    // }, [[], []]) || [[], []];

    // object for insert into orders table
    const orderFields = {};
    // add fields
    safeOrder.restaurantId && (orderFields['restaurant_id'] = safeOrder.restaurantId);
    safeOrder.status && (orderFields.status = safeOrder.status);
    orderFields.status === 'Completed' && (orderFields['fulfilled_at'] = new Date());
    safeOrder.waitMinutes && (orderFields['wait_minutes'] = safeOrder.waitMinutes);
    // set order of iteration
    const orderFieldKeys = Object.keys(orderFields);

    // only user and restaurant owner can update
    const bookedOrder = await db.query(`
      UPDATE orders SET (${orderFieldKeys.join(', ')}) = (${orderFieldKeys.map((_, i) => `$${i + 1}`).join(', ')})
      WHERE id = $${orderFieldKeys.length + 1} AND (
        user_id = $${orderFieldKeys.length + 2}
        OR
        id = (SELECT DISTINCT o_m_i.order_id FROM order_menu_items o_m_i
        JOIN menu_items m_i ON o_m_i.menu_item_id = m_i.id
        JOIN restaurants r ON m_i.restaurant_id = r.id
        WHERE o_m_i.order_id = $${orderFieldKeys.length + 1} AND r.owner_id = $${orderFieldKeys.length + 2})
      )
      RETURNING *;
    `, [... orderFieldKeys.map(key => orderFields[key]), safeOrder.id, userId]);

    if (bookedOrder.length !== 1) throw Error('Could not find order.');

    // return order id
    return bookedOrder[0].id;

  } catch (err) {
    throw Error(`Order could not be updated due to an error. Error: ${err.message}.`);
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


module.exports = { getOrder : get, createOrder: create, updateOrderStatus: updateStatus, completeOrder: complete, parseOrder: parse, getOrderData: getData, updateOrder: update };
