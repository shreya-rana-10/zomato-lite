-- Facts only: one restaurant, three reviews, dates a few days apart
-- so "latest" is meaningful. Each insert is guarded so re-running
-- this seed never creates duplicates.

INSERT INTO restaurants (name, cuisine, area)
SELECT 'Ludhiana Burrito', 'Indian', 'Sector 32'
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Ludhiana Burrito');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, 5, 'Paneer burrito is unreal', now() - interval '8 days'
FROM restaurants r
WHERE r.name = 'Ludhiana Burrito'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE comment = 'Paneer burrito is unreal');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, 4, 'Good, but slow service', now() - interval '6 days'
FROM restaurants r
WHERE r.name = 'Ludhiana Burrito'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE comment = 'Good, but slow service');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, 4, 'Solid. Would repeat.', now() - interval '2 days'
FROM restaurants r
WHERE r.name = 'Ludhiana Burrito'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE comment = 'Solid. Would repeat.');
