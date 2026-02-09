-- Add `feature` column to products.
-- Stores JSON array as text for broad MySQL/MariaDB compatibility.

ALTER TABLE dmac_webapp_products
  ADD COLUMN feature TEXT NULL AFTER subscription_list;

UPDATE dmac_webapp_products
  SET feature = '[]'
  WHERE feature IS NULL;

ALTER TABLE dmac_webapp_products
  MODIFY COLUMN feature TEXT NOT NULL;
