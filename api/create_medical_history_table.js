import { db } from './connect.js'

const createMedicalHistoryTable = `
CREATE TABLE IF NOT EXISTS dmac_webapp_medical_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  data LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),
  CONSTRAINT fk_medical_history_user
    FOREIGN KEY (user_id)
    REFERENCES dmac_webapp_users(id)
    ON DELETE CASCADE
)
`

db.query(createMedicalHistoryTable, (err) => {
  if (err) {
    console.error('Error creating dmac_webapp_medical_history table:', err)
  } else {
    console.log('dmac_webapp_medical_history table created or already exists.')
  }
  db.end()
})
