const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkLiensFamille7() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== MEMBRES DE LA FAMILLE 7 ===\n');

    const [membres] = await conn.execute(
        'SELECT id, prenom, nom, numero_identification FROM membre WHERE famille_id = 7 ORDER BY id'
    );

    for (const membre of membres) {
        console.log(`ID ${membre.id}: ${membre.prenom} ${membre.nom} - Numéro: ${membre.numero_identification}`);

        // Vérifier les liens parentaux (parents de ce membre)
        const [liens] = await conn.execute(`
            SELECT lp.type_lien, m.prenom, m.nom, m.numero_identification
            FROM lien_parental lp
            JOIN membre m ON lp.parent_id = m.id
            WHERE lp.enfant_id = ?
        `, [membre.id]);

        if (liens.length > 0) {
            liens.forEach(lien => {
                console.log(`  └─ ${lien.type_lien}: ${lien.prenom} ${lien.nom} (${lien.numero_identification})`);
            });
        } else {
            console.log(`  └─ RACINE (pas de parents)`);
        }
        console.log('');
    }

    // Compter les racines
    const [racines] = await conn.execute(`
        SELECT COUNT(DISTINCT m.id) as total
        FROM membre m
        LEFT JOIN lien_parental lp ON m.id = lp.enfant_id
        WHERE m.famille_id = 7 AND lp.id IS NULL
    `);

    console.log(`\n=== STATISTIQUES ===`);
    console.log(`Total membres: ${membres.length}`);
    console.log(`Total racines (sans parents): ${racines[0].total}`);
    console.log(`Prochain numéro racine: FAM7-${String(racines[0].total + 1).padStart(3, '0')}\n`);

    await conn.end();
}

checkLiensFamille7();
