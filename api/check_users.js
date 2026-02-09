
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
    host: process.env.HOST_NAME || 'localhost',
    user: process.env.USER_NAME || 'root',
    password: process.env.PASSWORD || 'admin',
    database: process.env.DATABASE || 'my_app_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to DB:', err);
        process.exit(1);
    }

    db.query('SELECT id, email, role FROM dmac_webapp_users', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
        } else {
            console.log('Users found:', results);
        }
        db.end();
    });
});
