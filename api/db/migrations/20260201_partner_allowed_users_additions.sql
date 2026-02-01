-- Track increments to partner allowed_users made by SUPER_ADMIN/ADMIN

CREATE TABLE IF NOT EXISTS dmac_webapp_partner_allowed_user_additions (
  id INT NOT NULL AUTO_INCREMENT,
  partner_id INT NOT NULL,
  added_users INT NOT NULL,
  added_by INT NOT NULL,
  added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partner_additions_partner_id (partner_id),
  KEY idx_partner_additions_added_by (added_by),
  CONSTRAINT fk_partner_additions_partner_id
    FOREIGN KEY (partner_id)
    REFERENCES dmac_webapp_users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_partner_additions_added_by
    FOREIGN KEY (added_by)
    REFERENCES dmac_webapp_users(id)
    ON DELETE RESTRICT
);
