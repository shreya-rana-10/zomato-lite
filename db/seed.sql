-- Facts only: restaurants and reviews, dates a few days apart so "latest"
-- is meaningful. Each insert is guarded so re-running this seed never
-- creates duplicates. Kilcha Junction is seeded with ZERO reviews on
-- purpose, so the empty state is real and testable.

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

-- Sharma Chole Kulche — North Indian, Sector 20
INSERT INTO restaurants (name, cuisine, area)
SELECT 'Sharma Chole Kulche', 'North Indian', 'Sector 20'
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Sharma Chole Kulche');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, 5, 'The chole taste like Sunday morning', now() - interval '3 days'
FROM restaurants r
WHERE r.name = 'Sharma Chole Kulche'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE comment = 'The chole taste like Sunday morning');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, 4, 'Stand near a napkin, trust me', now() - interval '10 days'
FROM restaurants r
WHERE r.name = 'Sharma Chole Kulche'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE comment = 'Stand near a napkin, trust me');

-- Tandoori Tiffin — Punjabi, Sarabha Nagar
INSERT INTO restaurants (name, cuisine, area)
SELECT 'Tandoori Tiffin', 'Punjabi', 'Sarabha Nagar'
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Tandoori Tiffin');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, 3, 'Amritsari kulcha entirely overrated, said everyone except me', now() - interval '1 day'
FROM restaurants r
WHERE r.name = 'Tandoori Tiffin'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE comment = 'Amritsari kulcha entirely overrated, said everyone except me');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, 2, 'Might be an acquired taste. Definitely not mine', now() - interval '9 days'
FROM restaurants r
WHERE r.name = 'Tandoori Tiffin'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE comment = 'Might be an acquired taste. Definitely not mine');

-- Dosa Diaries — South Indian, Model Town
INSERT INTO restaurants (name, cuisine, area)
SELECT 'Dosa Diaries', 'South Indian', 'Model Town'
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Dosa Diaries');

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, 5, 'Paper roast. Like an edible letter to the gods', now() - interval '5 days'
FROM restaurants r
WHERE r.name = 'Dosa Diaries'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE comment = 'Paper roast. Like an edible letter to the gods');

-- Kulcha Junction — Punjabi, Ghumar Mandi. Deliberately has ZERO reviews:
-- seed only the restaurant, review nothing, so the empty state is real.
INSERT INTO restaurants (name, cuisine, area)
SELECT 'Kulcha Junction', 'Punjabi', 'Ghumar Mandi'
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Kulcha Junction');
