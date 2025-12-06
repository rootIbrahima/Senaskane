// Script pour ajouter la colonne code_acces à la table famille
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;

  try {
    console.log('Connexion à la base de données...');

    // Créer la connexion
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('Connecté avec succès!');

    // Vérifier si la colonne existe déjà
    console.log('Vérification de la colonne code_acces...');
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM famille LIKE 'code_acces'`
    );

    if (columns.length > 0) {
      console.log('✓ La colonne code_acces existe déjà!');
      return;
    }

    // Ajouter la colonne
    console.log('Ajout de la colonne code_acces...');
    await connection.execute(
      'ALTER TABLE famille ADD COLUMN code_acces VARCHAR(20) UNIQUE'
    );

    console.log('✓ Migration réussie! La colonne code_acces a été ajoutée.');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connexion fermée.');
    }
  }
}

runMigration();
