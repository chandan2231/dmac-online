-- Migration: Create user_consents table for electronic signatures
CREATE TABLE IF NOT EXISTS user_consents (
  user_id INT PRIMARY KEY,
  form1_signature VARCHAR(255),
  form2_signature VARCHAR(255),
  form3_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
