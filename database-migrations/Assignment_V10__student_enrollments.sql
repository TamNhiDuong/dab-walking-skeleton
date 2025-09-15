CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

INSERT INTO students (name)
SELECT
  'Student ' || n AS name
FROM generate_series(1, 100000) AS s(n);

INSERT INTO enrollments (student_id, year)
SELECT
  id AS student_id,
  (FLOOR(RANDOM() * (2025 - 1990 + 1)) + 1990)::INTEGER AS year
FROM
  students;

-- EXAMPLE: Denormalize based on this query
-- SELECT items.name, COUNT(*) AS user_count
--   FROM items
--   JOIN users_to_items
--     ON items.id = users_to_items.item_id
--   GROUP BY items.id
--   LIMIT 10;
--
-- ALTER TABLE items
--   ADD COLUMN user_count INT DEFAULT 0;

-- WITH item_user_counts AS (
--   SELECT item_id, COUNT(*) AS user_count
--   FROM users_to_items
--   GROUP BY item_id
-- )
-- UPDATE items
--   SET user_count = item_user_counts.user_count
--   FROM item_user_counts
--   WHERE items.id = item_user_counts.item_id;


---------
--- Denormalize based on this query
-- SELECT
--   enrollments.year,
--   COUNT(*)
-- FROM enrollments
--   JOIN students ON enrollments.student_id = students.id
-- GROUP BY enrollments.year
-- ORDER BY enrollments.year;
--- Denormalize
ALTER TABLE enrollments
  ADD COLUMN count INT DEFAULT 0;

WITH year_counts AS (
  SELECT year, COUNT(*) AS count
  FROM enrollments
  GROUP BY year
)
UPDATE enrollments
  SET count = year_counts.count
  FROM year_counts
  WHERE enrollments.year= year_counts.year;

--- New select query
SELECT enrollments.year, count FROM enrollments;

--- Check performance
EXPLAIN ANALYZE SELECT enrollments.year, count FROM enrollments;