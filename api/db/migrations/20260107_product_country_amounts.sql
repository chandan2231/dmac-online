-- Product per-country amount support
-- Stores JSON array as text for broad MySQL/MariaDB compatibility.

ALTER TABLE dmac_webapp_products
  ADD COLUMN country_amounts TEXT NULL AFTER product_amount;

