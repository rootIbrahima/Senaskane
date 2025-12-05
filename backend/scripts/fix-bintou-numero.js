const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixBintouNumero() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== CORRECTION DU NUMÉRO DE BINTOU ===\n');

    try {
        await conn.beginTransaction();

        // Vérifier l'état actuel
        const [current] = await conn.execute(
            'SELECT id, prenom, nom, numero_identification FROM membre WHERE id = 44'
        );

        if (current.length === 0) {
            console.log('❌ Membre 44 non trouvé');
            return;
        }

        console.log(`État actuel:`);
        console.log(`  ${current[0].prenom} ${current[0].nom} - ${current[0].numero_identification}`);

        // Vérifier le parent
        const [parent] = await conn.execute(`
            SELECT m.numero_identification
            FROM lien_parental lp
            JOIN membre m ON lp.parent_id = m.id
            WHERE lp.enfant_id = 44
            LIMIT 1
        `);

        if (parent.length === 0) {
            console.log('❌ Aucun parent trouvé pour bintou');
            return;
        }

        const numeroParent = parent[0].numero_identification;
        console.log(`  Parent: ${numeroParent}`);

        // Compter les enfants du parent
        const [enfants] = await conn.execute(`
            SELECT COUNT(*) as total
            FROM lien_parental
            WHERE parent_id = (SELECT parent_id FROM lien_parental WHERE enfant_id = 44 LIMIT 1)
        `);

        const compteur = enfants[0].total;
        const nouveauNumero = `${numeroParent}.${String(compteur).padStart(3, '0')}`;

        console.log(`\nCorrection:`);
        console.log(`  ${current[0].numero_identification} → ${nouveauNumero}`);

        // Mettre à jour
        await conn.execute(
            'UPDATE membre SET numero_identification = ? WHERE id = 44',
            [nouveauNumero]
        );

        await conn.commit();
        console.log('\n✅ Correction effectuée avec succès!\n');

    } catch (error) {
        await conn.rollback();
        console.error('❌ Erreur:', error.message);
    } finally {
        await conn.end();
    }
}

fixBintouNumero();
