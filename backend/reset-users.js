// Script pour réinitialiser les utilisateurs et familles
require('dotenv').config();
const db = require('./config/database');

async function resetUsers() {
    try {
        console.log('🔄 Réinitialisation des utilisateurs et familles...\n');

        // Désactiver les contraintes de clés étrangères temporairement
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');

        // Vider les tables dans l'ordre correct
        await db.execute('DELETE FROM utilisateur');
        console.log('✅ Table utilisateur vidée');

        await db.execute('DELETE FROM famille');
        console.log('✅ Table famille vidée');

        // Réactiver les contraintes
        await db.execute('SET FOREIGN_KEY_CHECKS = 1');

        // Réinitialiser les auto-increment
        await db.execute('ALTER TABLE utilisateur AUTO_INCREMENT = 1');
        await db.execute('ALTER TABLE famille AUTO_INCREMENT = 1');
        console.log('✅ Auto-increment réinitialisés');

        console.log('\n✨ Réinitialisation terminée avec succès !');
        console.log('Vous pouvez maintenant créer un nouveau compte.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error.message);
        process.exit(1);
    }
}

resetUsers();
