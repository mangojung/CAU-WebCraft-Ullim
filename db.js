require('dotenv').config();
const mysql = require('mysql');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  connectionLimit: 10,
  connectTimeout: 10000,
});

pool.on('acquire', (c) => console.log(`📌 MySQL connection ${c.threadId} acquired`));
pool.on('release', (c) => console.log(`📌 MySQL connection ${c.threadId} released`));

module.exports = pool;

