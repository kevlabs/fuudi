DROP TABLE IF EXISTS orders CASCADE;
DROP TYPE IF EXISTS order_progress CASCADE;

CREATE TYPE order_progress AS ENUM ('Pending', 'In Progress', 'Completed', 'Declined');

CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  fulfilled_at TIMESTAMP DEFAULT NULL,
  fulfilled_at_est TIMESTAMP DEFAULT NULL,
  total_cents INTEGER NOT NULL,
  wait_minutes SMALLINT DEFAULT 0,
  status order_progress DEFAULT 'Pending'
);
