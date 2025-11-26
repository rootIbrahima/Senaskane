// Test de connexion à la base de données
require('dotenv').config();
const db = require('./config/database');

console.log('Configuration de la base de données:');
console.log('- Host:', process.env.DB_HOST);
console.log('- User:', process.env.DB_USER);
console.log('- Password:', process.env.DB_PASSWORD ? '***' : '(vide)');
console.log('- Database:', process.env.DB_NAME);

async function testConnection() {
    try {
        console.log('\nTest de connexion...');
        const [rows] = await db.execute('SELECT 1 + 1 AS result');
        console.log('✅ Connexion réussie!');
        console.log('Résultat du test:', rows);

        // Tester l'accès à la base senaskane_db
        const [tables] = await db.execute('SHOW TABLES');
        console.log('\n✅ Tables dans senaskane_db:');
        tables.forEach(table => {
            console.log('  -', Object.values(table)[0]);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.error('Code:', error.code);
        console.error('SQL State:', error.sqlState);
        process.exit(1);
    }
}

testConnection();
