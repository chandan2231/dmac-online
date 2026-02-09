
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Using credentials from .env
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

    // Get the first user to generate a token for
    // Note: changing table name to dmac_webapp_users as seen in auth.js, checking if DB matches
    // If my_app_db is the wrong DB name, checking connect.js would help, but let's try this.
    db.query('SELECT * FROM dmac_webapp_users WHERE role = "USER" LIMIT 1', (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            // Fallback: maybe the table name is different or DB is different?
            db.query('SHOW TABLES', (err, tables) => {
                if (!err) console.log('Tables in DB:', tables);
                process.exit(1);
            });
            return;
        }

        if (results.length === 0) {
            console.error('No users found in database to test with.');
            process.exit(1);
        }

        const user = results[0];
        const userId = user.id;

        // Generate token (matching the logic in auth.js)
        const token = jwt.sign(
            { userId: userId, userType: 'USER' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('\n---------------------------------------------------');
        console.log('TEST LINK GENERATED:');
        // Ensure port 3011 is used since that's where the frontend is running
        console.log(`http://localhost:3010/questioners?token=${token}`);
        console.log('---------------------------------------------------\n');

        db.end();
    });
});
