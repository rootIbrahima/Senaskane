// config/database.js - Configuration de la base de données
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'senaskane_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // SSL requis pour Aiven et autres providers cloud
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;