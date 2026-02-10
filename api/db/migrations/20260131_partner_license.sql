-- Partner License / Partners feature
-- Adds a way to store partner constraints (total allowed users) and link users to partners.

ALTER TABLE dmac_webapp_users
  ADD COLUMN partner_id INT NULL;

CREATE TABLE IF NOT EXISTS dmac_webapp_partner_users (
  id INT NOT NULL AUTO_INCREMENT,
  partner_id INT NOT NULL,
  allowed_users INT NOT NULL DEFAULT 0,
  active_users INT NOT NULL DEFAULT 0,
  remaining_users INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_partner_users_partner_id (partner_id),
  CONSTRAINT fk_partner_users_partner_id
    FOREIGN KEY (partner_id)
    REFERENCES dmac_webapp_users(id)
    ON DELETE CASCADE
);
