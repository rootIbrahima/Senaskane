const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;

  try {
    console.log('📡 Connexion à Railway MySQL...');

    connection = await mysql.createConnection({
      host: 'turntable.proxy.rlwy.net',
      port: 14312,
      user: 'root',
      password: 'WtBDkFjVHenAJGrAYsOAJkVozUHrtqGl',
      database: 'railway',
      multipleStatements: true
    });

    console.log('✅ Connecté à Railway!');
    console.log('📝 Lecture du fichier SQL...');

    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'railway_schema.sql'),
      'utf8'
    );

    console.log('🚀 Exécution des requêtes SQL...');

    await connection.query(sqlFile);

    console.log('\n✅ SUCCÈS! Toutes les tables ont été créées!');
    console.log('\n📊 Tables créées:');
    console.log('   - famille');
    console.log('   - utilisateur');
    console.log('   - membre');
    console.log('   - lien_parental');
    console.log('   - ceremonie');
    console.log('   - parrain_marraine');
    console.log('   - organisateur_ceremonie');
    console.log('   - tresorier_ceremonie');
    console.log('   - recette_ceremonie');
    console.log('   - depense_ceremonie');
    console.log('   - musee_familial');
    console.log('   - bande_passante');
    console.log('   - abonnement');
    console.log('   - session_utilisateur');
    console.log('\n🎉 La base de données est prête!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
