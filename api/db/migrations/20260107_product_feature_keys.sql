-- Global product feature keys
-- Stores the global list of feature keys that should exist on every product.

CREATE TABLE IF NOT EXISTS dmac_webapp_product_feature_keys (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  key_type ENUM('radio','text') NOT NULL DEFAULT 'text',
  value VARCHAR(255) NOT NULL DEFAULT '',
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_feature_key_title (title)
);
