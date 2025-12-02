import { db } from './connect.js'

const createExpertReviewsTable = `
CREATE TABLE IF NOT EXISTS expert_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  expert_id INT NOT NULL,
  consultation_id INT NOT NULL,
  rating INT NOT NULL,
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_consultation (consultation_id)
)`

const createTherapistReviewsTable = `
CREATE TABLE IF NOT EXISTS therapist_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  therapist_id INT NOT NULL,
  consultation_id INT NOT NULL,
  rating INT NOT NULL,
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_consultation (consultation_id)
)`

db.query(createExpertReviewsTable, (err, result) => {
  if (err) {
    console.error('Error creating expert_reviews table:', err)
  } else {
    console.log('expert_reviews table created or already exists.')
  }
})

db.query(createTherapistReviewsTable, (err, result) => {
  if (err) {
    console.error('Error creating therapist_reviews table:', err)
  } else {
    console.log('therapist_reviews table created or already exists.')
  }
  process.exit()
})
