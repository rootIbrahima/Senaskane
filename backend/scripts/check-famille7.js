const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkFamille7() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await conn.execute(
        'SELECT id, prenom, nom, numero_identification FROM membre WHERE famille_id = 7 ORDER BY numero_identification'
    );

    console.log('\nMembres de la famille 7:');
    console.log('========================');
    rows.forEach(r => {
        console.log(`ID ${r.id}: ${r.prenom} ${r.nom} - Numéro: ${r.numero_identification}`);
    });
    console.log(`\nTotal: ${rows.length} membres\n`);

    await conn.end();
}

checkFamille7();
