DROP TABLE IF EXISTS menu_items CASCADE;

CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY NOT NULL,
  restaurant_id INTEGER REFERENCES restaurants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  price_cents INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);
