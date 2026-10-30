-- The shape of our facts: two tables, nothing computed.
-- Deliberately NO average_rating column and NO latest_review column.
-- An average is not a fact; it is an answer computed at the moment somebody asks.
-- If we stored it, we would have to remember to update it on every new review —
-- and the day we forget, the app lies to users.

CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  area TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
