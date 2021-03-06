DROP TABLE IF EXISTS restaurants CASCADE;

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  phone VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  post_code CHAR(6) NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  wait_minutes SMALLINT NOT NULL,
  rating SMALLINT DEFAULT 0,
  rating_expires_at TIMESTAMP DEFAULT NOW(),
  rating_url VARCHAR(255) DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE
);
