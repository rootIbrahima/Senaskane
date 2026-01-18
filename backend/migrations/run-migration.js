// Script de migration pour Aiven
// Usage: node migrations/run-migration.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    let connection;

    try {
        console.log('📡 Connexion à Aiven MySQL...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'defaultdb',
            ssl: {
                rejectUnauthorized: false
            },
            multipleStatements: true
        });

        console.log('✅ Connecté à Aiven!');

        // Migration 1: Ajouter colonnes à ceremonie
        console.log('\n📝 Ajout des colonnes à la table ceremonie...');
        try {
            await connection.execute(`
                ALTER TABLE ceremonie
                ADD COLUMN necessite_cotisation BOOLEAN DEFAULT FALSE
            `);
            console.log('   ✅ Colonne necessite_cotisation ajoutée');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   ℹ️ Colonne necessite_cotisation existe déjà');
            } else {
                throw e;
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE ceremonie
                ADD COLUMN montant_cotisation DECIMAL(10,2) DEFAULT 0
            `);
            console.log('   ✅ Colonne montant_cotisation ajoutée');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   ℹ️ Colonne montant_cotisation existe déjà');
            } else {
                throw e;
            }
        }

        // Migration 2: Créer table cotisation_ceremonie
        console.log('\n📝 Création de la table cotisation_ceremonie...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS cotisation_ceremonie (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ceremonie_id INT NOT NULL,
                membre_id INT NOT NULL,
                montant DECIMAL(10,2) NOT NULL,
                a_cotise BOOLEAN DEFAULT FALSE,
                date_cotisation TIMESTAMP NULL,
                mode_paiement ENUM('especes', 'orange_money', 'wave', 'virement', 'autre') NULL,
                reference_paiement VARCHAR(100) NULL,
                notes TEXT NULL,
                enregistre_par INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE,
                FOREIGN KEY (membre_id) REFERENCES membre(id) ON DELETE CASCADE,
                FOREIGN KEY (enregistre_par) REFERENCES utilisateur(id) ON DELETE SET NULL,
                UNIQUE KEY unique_cotisation_membre (ceremonie_id, membre_id)
            )
        `);
        console.log('   ✅ Table cotisation_ceremonie créée');

        // Migration 3: Créer table historique_mdp_tresorier
        console.log('\n📝 Création de la table historique_mdp_tresorier...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS historique_mdp_tresorier (
                id INT AUTO_INCREMENT PRIMARY KEY,
                utilisateur_id INT NOT NULL,
                ceremonie_id INT NOT NULL,
                est_premier_changement BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
                FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE
            )
        `);
        console.log('   ✅ Table historique_mdp_tresorier créée');

        // Migration 4: Ajouter colonnes à depense_ceremonie
        console.log('\n📝 Ajout des colonnes à depense_ceremonie...');
        try {
            await connection.execute(`
                ALTER TABLE depense_ceremonie
                ADD COLUMN enregistre_par INT NULL
            `);
            console.log('   ✅ Colonne enregistre_par ajoutée');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   ℹ️ Colonne enregistre_par existe déjà');
            } else {
                throw e;
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE depense_ceremonie
                ADD COLUMN libelle VARCHAR(200) NULL
            `);
            console.log('   ✅ Colonne libelle ajoutée');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   ℹ️ Colonne libelle existe déjà');
            } else {
                throw e;
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE depense_ceremonie
                ADD COLUMN justificatif VARCHAR(255) NULL
            `);
            console.log('   ✅ Colonne justificatif ajoutée');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   ℹ️ Colonne justificatif existe déjà');
            } else {
                throw e;
            }
        }

        // Migration 5: Créer les index
        console.log('\n📝 Création des index...');
        try {
            await connection.execute(`CREATE INDEX idx_cotisation_ceremonie ON cotisation_ceremonie(ceremonie_id)`);
            console.log('   ✅ Index idx_cotisation_ceremonie créé');
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                console.log('   ℹ️ Index idx_cotisation_ceremonie existe déjà');
            }
        }

        try {
            await connection.execute(`CREATE INDEX idx_cotisation_membre ON cotisation_ceremonie(membre_id)`);
            console.log('   ✅ Index idx_cotisation_membre créé');
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                console.log('   ℹ️ Index idx_cotisation_membre existe déjà');
            }
        }

        console.log('\n✅ MIGRATION TERMINÉE AVEC SUCCÈS!');
        console.log('\n📊 Tables ajoutées/modifiées:');
        console.log('   - ceremonie (colonnes: necessite_cotisation, montant_cotisation)');
        console.log('   - cotisation_ceremonie');
        console.log('   - historique_mdp_tresorier');
        console.log('   - depense_ceremonie (colonnes: enregistre_par, libelle, justificatif)');

    } catch (error) {
        console.error('\n❌ ERREUR MIGRATION:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n👋 Connexion fermée');
        }
    }
}

runMigration();
