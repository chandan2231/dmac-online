-- Add price per user for partner additional user purchases

ALTER TABLE dmac_webapp_partner_users
  ADD COLUMN price_per_user DECIMAL(10,2) NOT NULL DEFAULT 19.99;
