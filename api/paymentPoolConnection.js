import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config({ path: '.env', override: true })

const { HOST_NAME, USER_NAME, PASSWORD, DATABASE, PORT } = process.env

export const paymentPoolConnection = mysql.createPool({
  host: HOST_NAME,
  user: USER_NAME,
  password: PASSWORD,
  database: DATABASE,
  port: PORT,
  connectionLimit: 5,      // small & safe
  waitForConnections: true,
  queueLimit: 0
})
