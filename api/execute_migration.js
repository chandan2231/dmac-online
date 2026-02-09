import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env', override: true });
const { HOST_NAME, USER_NAME, PASSWORD, DATABASE, PORT } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.join(__dirname, '../insert_audio_instruction_translations.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const connection = mysql.createConnection({
    host: HOST_NAME,
    user: USER_NAME,
    password: PASSWORD,
    database: DATABASE,
    port: PORT,
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        process.exit(1);
    }
    console.log('Connected as id ' + connection.threadId);
});

connection.query(sql, (error, results) => {
    if (error) {
        console.error('Error executing query:', error);
        process.exit(1);
    }
    console.log('SQL executed successfully:', results);
    connection.end();
});
