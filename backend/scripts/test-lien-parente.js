const mysql = require('mysql2/promise');
require('dotenv').config();

async function testLienParente() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== TEST LIEN DE PARENTÉ ===\n');

    // Test entre Ibrahima (40) et amadou (41)
    console.log('Test 1: Ibrahima (40) et amadou (41)');

    const query = `
        WITH RECURSIVE arbre_ascendant1 AS (
            SELECT id, numero_identification, nom, prenom, 0 as niveau
            FROM membre WHERE id = ? AND famille_id = ?
            UNION ALL
            SELECT m.id, m.numero_identification, m.nom, m.prenom, aa.niveau + 1
            FROM membre m
            JOIN lien_parental lp ON m.id = lp.parent_id
            JOIN arbre_ascendant1 aa ON lp.enfant_id = aa.id
            WHERE aa.niveau < 10
        ),
        arbre_ascendant2 AS (
            SELECT id, numero_identification, nom, prenom, 0 as niveau
            FROM membre WHERE id = ? AND famille_id = ?
            UNION ALL
            SELECT m.id, m.numero_identification, m.nom, m.prenom, aa.niveau + 1
            FROM membre m
            JOIN lien_parental lp ON m.id = lp.parent_id
            JOIN arbre_ascendant2 aa ON lp.enfant_id = aa.id
            WHERE aa.niveau < 10
        )
        SELECT aa1.*, aa2.niveau as niveau2
        FROM arbre_ascendant1 aa1
        JOIN arbre_ascendant2 aa2 ON aa1.id = aa2.id
        ORDER BY aa1.niveau + aa2.niveau
        LIMIT 1
    `;

    try {
        const [result] = await conn.execute(query, [40, 7, 41, 7]);
        console.log('Résultat:', result);

        if (result.length > 0) {
            const ancetre = result[0];
            const degre = ancetre.niveau + ancetre.niveau2;
            console.log(`\nAncêtre commun: ${ancetre.prenom} ${ancetre.nom}`);
            console.log(`Degré: ${degre}`);
            console.log(`Niveau 1: ${ancetre.niveau}, Niveau 2: ${ancetre.niveau2}`);
        } else {
            console.log('❌ Aucun lien trouvé');
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }

    // Test entre amadou (41) et bintou (44)
    console.log('\n\nTest 2: amadou (41) et bintou (44)');

    try {
        const [result2] = await conn.execute(query, [41, 7, 44, 7]);
        console.log('Résultat:', result2);

        if (result2.length > 0) {
            const ancetre = result2[0];
            const degre = ancetre.niveau + ancetre.niveau2;
            console.log(`\nAncêtre commun: ${ancetre.prenom} ${ancetre.nom}`);
            console.log(`Degré: ${degre}`);
            console.log(`Niveau 1: ${ancetre.niveau}, Niveau 2: ${ancetre.niveau2}`);
        } else {
            console.log('❌ Aucun lien trouvé');
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }

    await conn.end();
}

testLienParente();
