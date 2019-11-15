DROP TABLE IF EXISTS order_menu_items CASCADE;

CREATE TABLE order_menu_items (
  id SERIAL PRIMARY KEY NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  menu_item_id INTEGER REFERENCES menu_items(id),
  quantity SMALLINT DEFAULT 0,
  price_cents INTEGER DEFAULT 0
);
