const mysql = require('mysql2/promise');
require('dotenv').config();

// Fonction pour générer un code d'accès unique
function genererCodeAcces() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Pas de O, 0, I, 1 pour éviter confusion
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function main() {
    let connection;

    try {
        // Connexion à la base de données
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connexion à la base de données établie\n');

        // Vérifier si la colonne existe déjà
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'famille' AND COLUMN_NAME = 'code_acces'
        `, [process.env.DB_NAME]);

        if (columns.length > 0) {
            console.log('⚠️  La colonne code_acces existe déjà');
            return;
        }

        // Ajouter la colonne code_acces
        console.log('📝 Ajout de la colonne code_acces...');
        await connection.execute(`
            ALTER TABLE famille
            ADD COLUMN code_acces VARCHAR(20) UNIQUE NULL AFTER nom_famille
        `);
        console.log('✅ Colonne code_acces ajoutée\n');

        // Générer des codes pour les familles existantes
        console.log('🔑 Génération des codes d\'accès pour les familles existantes...\n');
        const [familles] = await connection.execute('SELECT id, nom_famille FROM famille');

        for (const famille of familles) {
            let codeUnique = false;
            let code = '';

            // Générer un code unique
            while (!codeUnique) {
                code = genererCodeAcces();
                const [existing] = await connection.execute(
                    'SELECT id FROM famille WHERE code_acces = ?',
                    [code]
                );
                if (existing.length === 0) {
                    codeUnique = true;
                }
            }

            // Mettre à jour la famille avec le code
            await connection.execute(
                'UPDATE famille SET code_acces = ? WHERE id = ?',
                [code, famille.id]
            );

            console.log(`✅ Famille "${famille.nom_famille}" (ID: ${famille.id})`);
            console.log(`   Code d'accès: ${code}\n`);
        }

        console.log('✅ Migration terminée avec succès !');
        console.log(`\n📊 Total: ${familles.length} familles mises à jour`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Connexion fermée');
        }
    }
}

main().catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
});
