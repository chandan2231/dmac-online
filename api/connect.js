import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config({ path: ".env", override: true });

const { HOST_NAME, USER_NAME, PASSWORD, DATABASE, PORT } = process.env;

export const db = mysql.createPool({
  host: HOST_NAME,
  user: USER_NAME,
  password: PASSWORD,
  database: DATABASE,
  port: PORT,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

/**
 * This is critical for AWS — handles dead sockets safely
 */
db.on("connection", (conn) => {
  console.log("MySQL connected:", conn.threadId);

  conn.on("error", (err) => {
    console.error("MySQL connection error:", err.code);

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("AWS killed idle MySQL connection — pool will replace it.");
    }
  });
});


// commented the old one

// import mysql from 'mysql2'
// import dotenv from 'dotenv'
// dotenv.config({ path: `.env`, override: true })
// const { HOST_NAME, USER_NAME, PASSWORD, DATABASE, PORT } = process.env

// export const db = mysql.createConnection({
//   host: HOST_NAME,
//   user: USER_NAME,
//   password: PASSWORD,
//   database: DATABASE,
//   port: PORT
// })

// db.connect(function (err) {
//   if (err) throw err
//   console.log('You are now connected...')
// })