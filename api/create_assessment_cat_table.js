import { db } from './connect.js'

const createAssessmentCatTable = `
CREATE TABLE IF NOT EXISTS dmac_webapp_assessment_cat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  data LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),
  CONSTRAINT fk_assessment_cat_user
    FOREIGN KEY (user_id)
    REFERENCES dmac_webapp_users(id)
    ON DELETE CASCADE
)
`

db.query(createAssessmentCatTable, (err) => {
  if (err) {
    console.error('Error creating dmac_webapp_assessment_cat table:', err)
  } else {
    console.log('dmac_webapp_assessment_cat table created or already exists.')
  }
  db.end()
})
