// routes/admin.js - Routes d'administration (à supprimer après migration)
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /admin/migrate-code-acces
 * Endpoint temporaire pour exécuter la migration de la colonne code_acces
 * À SUPPRIMER après que la migration ait été exécutée en production
 */
router.post('/migrate-code-acces', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('🔧 Début migration code_acces...');

        // Vérifier si la colonne existe déjà
        const [columns] = await db.execute(
            `SHOW COLUMNS FROM famille LIKE 'code_acces'`
        );

        if (columns.length > 0) {
            return res.json({
                success: true,
                message: 'La colonne code_acces existe déjà!',
                alreadyExists: true
            });
        }

        // Ajouter la colonne
        console.log('➕ Ajout de la colonne code_acces...');
        await db.execute(
            'ALTER TABLE famille ADD COLUMN code_acces VARCHAR(20) UNIQUE'
        );

        console.log('✅ Migration terminée avec succès!');

        res.json({
            success: true,
            message: 'Migration réussie! La colonne code_acces a été ajoutée à la table famille.'
        });

    } catch (error) {
        console.error('❌ Erreur migration:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la migration',
            details: error.message
        });
    }
});

/**
 * GET /admin/check-migration
 * Vérifier si la migration code_acces a été effectuée
 */
router.get('/check-migration', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [columns] = await db.execute(
            `SHOW COLUMNS FROM famille LIKE 'code_acces'`
        );

        res.json({
            migrated: columns.length > 0,
            message: columns.length > 0
                ? 'La colonne code_acces existe'
                : 'La colonne code_acces n\'existe pas encore'
        });

    } catch (error) {
        console.error('Erreur vérification:', error);
        res.status(500).json({
            error: 'Erreur lors de la vérification',
            details: error.message
        });
    }
});

module.exports = router;
