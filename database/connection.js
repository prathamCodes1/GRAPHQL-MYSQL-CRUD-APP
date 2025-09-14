
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config('.env');
let db;
try {
    db = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    });
    console.log('Successfully connected to database');
} catch (err) {
    console.log('Error while connecting to DB');
}

export { db };
