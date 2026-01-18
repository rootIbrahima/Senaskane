// config/database.js - Configuration de la base de données
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'senaskane_db',
    waitForConnections: true,
    connectionLimit: 5, // Réduit pour Aiven gratuit (limite de connexions)
    queueLimit: 0,
    connectTimeout: 30000, // 30 secondes pour se connecter
    acquireTimeout: 30000, // 30 secondes pour acquérir une connexion
    timeout: 60000, // 60 secondes timeout général
    enableKeepAlive: true, // Garde la connexion active
    keepAliveInitialDelay: 10000, // Ping toutes les 10 secondes
    // SSL requis pour Aiven et autres providers cloud
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};

const pool = mysql.createPool(dbConfig);

// Tester la connexion au démarrage
pool.getConnection()
    .then(connection => {
        console.log('Connexion à la base de données réussie');
        connection.release();
    })
    .catch(err => {
        console.error('Erreur de connexion à la base de données:', err.message);
    });

module.exports = pool;