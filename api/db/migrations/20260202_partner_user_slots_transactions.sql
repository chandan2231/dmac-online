-- Track partner purchases of additional allowed users (via partner portal payments)

CREATE TABLE IF NOT EXISTS dmac_webapp_partner_users_transactions (
  id INT NOT NULL AUTO_INCREMENT,
  partner_id INT NOT NULL,

  order_id VARCHAR(80) NOT NULL,
  payment_id VARCHAR(80) NULL,
  payer_id VARCHAR(80) NULL,

  added_users INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 19.99,
  amount_expected DECIMAL(10,2) NOT NULL,
  amount_captured DECIMAL(10,2) NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',

  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  failure_reason TEXT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uniq_partner_user_tx_order_id (order_id),
  KEY idx_partner_user_tx_partner_id (partner_id),
  CONSTRAINT fk_partner_user_tx_partner_id
    FOREIGN KEY (partner_id)
    REFERENCES dmac_webapp_users(id)
    ON DELETE CASCADE
);
