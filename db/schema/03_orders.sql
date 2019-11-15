CREATE TYPE progress AS ENUM ('Pending', 'Confirmed', 'In Progress', 'Completed', 'Declined');

CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  fulfilled_at TIMESTAMP NOT NULL,
  total_cents INTEGER NOT NULL,
  status progress 
)