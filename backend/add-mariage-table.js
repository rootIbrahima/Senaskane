const mysql = require('mysql2/promise');

async function addMariageTable() {
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
    console.log('📝 Ajout de la table mariage...');

    const sqlStatements = `
-- Table des mariages/unions
CREATE TABLE IF NOT EXISTS mariage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    famille_id INT NOT NULL,
    conjoint1_id INT NOT NULL,
    conjoint2_id INT NOT NULL,
    date_mariage DATE,
    lieu_mariage VARCHAR(150),
    statut ENUM('actif', 'divorce', 'veuvage') DEFAULT 'actif',
    date_fin DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES famille(id) ON DELETE CASCADE,
    FOREIGN KEY (conjoint1_id) REFERENCES membre(id) ON DELETE CASCADE,
    FOREIGN KEY (conjoint2_id) REFERENCES membre(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mariage (conjoint1_id, conjoint2_id)
);

-- Index pour optimiser les performances
CREATE INDEX idx_mariage_conjoint1 ON mariage(conjoint1_id);
CREATE INDEX idx_mariage_conjoint2 ON mariage(conjoint2_id);
CREATE INDEX idx_mariage_famille ON mariage(famille_id);
    `;

    await connection.query(sqlStatements);

    console.log('\n✅ SUCCÈS! Table mariage créée avec tous ses index!');

    // Vérification
    const [tables] = await connection.query("SHOW TABLES LIKE 'mariage'");
    if (tables.length > 0) {
      console.log('✓ Table mariage confirmée dans la base de données');

      const [columns] = await connection.query("DESCRIBE mariage");
      console.log('\n📊 Structure de la table mariage:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMariageTable();
