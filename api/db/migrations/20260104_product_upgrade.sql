-- Product Upgrade support
-- Run these ALTERs against your DMAC webapp database.

-- 1) Product tier / priority
ALTER TABLE dmac_webapp_products
  ADD COLUMN upgrade_priority INT NULL DEFAULT NULL AFTER product_amount;

-- 2) Transaction upgrade metadata
-- NOTE: `amount` continues to store the charged amount (full price for new purchase, or price-difference for upgrade).
ALTER TABLE dmac_webapp_users_transaction
  ADD COLUMN is_upgrade TINYINT(1) NOT NULL DEFAULT 0 AFTER payment_type,
  ADD COLUMN upgrade_from_product_id INT NULL AFTER is_upgrade,
  ADD COLUMN full_product_amount DECIMAL(10,2) NULL AFTER upgrade_from_product_id,
  ADD COLUMN price_difference_amount DECIMAL(10,2) NULL AFTER full_product_amount;

-- Optional: helpful indexes
CREATE INDEX idx_users_transaction_user_status_date
  ON dmac_webapp_users_transaction (user_id, status, created_date);

CREATE INDEX idx_users_transaction_upgrade_from
  ON dmac_webapp_users_transaction (upgrade_from_product_id);
