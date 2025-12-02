import { db } from './connect.js'

const createDocumentTable = `
CREATE TABLE IF NOT EXISTS patient_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    s3_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES dmac_webapp_users(id) ON DELETE CASCADE
)
`

db.query(createDocumentTable, (err, result) => {
  if (err) {
    console.error('Error creating patient_documents table:', err)
  } else {
    console.log('patient_documents table created or already exists.')
  }
  db.end()
})
