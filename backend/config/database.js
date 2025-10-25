// config/database.js - Configuration de la base de données
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'amadou',
    password: process.env.DB_PASSWORD || 'P@sser2002',
    database: process.env.DB_NAME || 'senaskane_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;