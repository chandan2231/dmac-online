-- Partner Consents
-- Store partner consent signatures separately from user consents.

CREATE TABLE IF NOT EXISTS dmac_webapp_partner_consents (
  partner_id INT NOT NULL,
  form1_signature VARCHAR(255),
  form2_signature VARCHAR(255),
  form3_signature VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (partner_id),
  CONSTRAINT fk_partner_consents_partner_id
    FOREIGN KEY (partner_id)
    REFERENCES dmac_webapp_users(id)
    ON DELETE CASCADE
);

-- Optional: backfill any existing partner consent data previously stored in dmac_webapp_user_consents
-- Assumes partner consents were stored with user_id = partner's user id.
INSERT INTO dmac_webapp_partner_consents (partner_id, form1_signature, form2_signature, form3_signature)
SELECT c.user_id, c.form1_signature, c.form2_signature, c.form3_signature
FROM dmac_webapp_user_consents c
INNER JOIN dmac_webapp_users u ON u.id = c.user_id AND u.role = 'PARTNER'
ON DUPLICATE KEY UPDATE
  form1_signature = VALUES(form1_signature),
  form2_signature = VALUES(form2_signature),
  form3_signature = VALUES(form3_signature),
  updated_at = CURRENT_TIMESTAMP;
