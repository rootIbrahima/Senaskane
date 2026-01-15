// Script pour exécuter la migration add_tresorier_role.sql
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    let connection;
    try {
        // Créer la connexion
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'senaskane_db',
            multipleStatements: true
        });

        console.log('Connexion à la base de données établie');

        // Lire le fichier SQL
        const migrationPath = path.join(__dirname, 'migrations', 'add_tresorier_role.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Exécution de la migration...');

        // Exécuter la migration
        await connection.query(sql);

        console.log('✅ Migration terminée avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();
