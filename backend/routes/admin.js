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

/**
 * POST /admin/run-cotisation-migration
 * Exécuter la migration des tables de cotisation
 */
router.post('/run-cotisation-migration', authenticateToken, requireAdmin, async (req, res) => {
    const results = [];

    try {
        // Migration 1: Ajouter colonnes à ceremonie
        console.log('📝 Ajout des colonnes à la table ceremonie...');
        try {
            await db.execute(`
                ALTER TABLE ceremonie
                ADD COLUMN necessite_cotisation BOOLEAN DEFAULT FALSE
            `);
            results.push({ step: 'ceremonie.necessite_cotisation', status: 'added' });
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                results.push({ step: 'ceremonie.necessite_cotisation', status: 'already_exists' });
            } else {
                throw e;
            }
        }

        try {
            await db.execute(`
                ALTER TABLE ceremonie
                ADD COLUMN montant_cotisation DECIMAL(10,2) DEFAULT 0
            `);
            results.push({ step: 'ceremonie.montant_cotisation', status: 'added' });
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                results.push({ step: 'ceremonie.montant_cotisation', status: 'already_exists' });
            } else {
                throw e;
            }
        }

        // Migration 2: Créer table cotisation_ceremonie
        console.log('📝 Création de la table cotisation_ceremonie...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS cotisation_ceremonie (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ceremonie_id INT NOT NULL,
                membre_id INT NOT NULL,
                montant DECIMAL(10,2) NOT NULL,
                a_cotise BOOLEAN DEFAULT FALSE,
                date_cotisation TIMESTAMP NULL,
                mode_paiement ENUM('especes', 'orange_money', 'wave', 'virement', 'autre') NULL,
                reference_paiement VARCHAR(100) NULL,
                notes TEXT NULL,
                enregistre_par INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE,
                FOREIGN KEY (membre_id) REFERENCES membre(id) ON DELETE CASCADE,
                UNIQUE KEY unique_cotisation_membre (ceremonie_id, membre_id)
            )
        `);
        results.push({ step: 'cotisation_ceremonie', status: 'created' });

        // Migration 3: Créer table historique_mdp_tresorier
        console.log('📝 Création de la table historique_mdp_tresorier...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS historique_mdp_tresorier (
                id INT AUTO_INCREMENT PRIMARY KEY,
                utilisateur_id INT NOT NULL,
                ceremonie_id INT NOT NULL,
                est_premier_changement BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
                FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE
            )
        `);
        results.push({ step: 'historique_mdp_tresorier', status: 'created' });

        // Migration 4: Ajouter colonnes à depense_ceremonie
        console.log('📝 Ajout des colonnes à depense_ceremonie...');
        try {
            await db.execute(`
                ALTER TABLE depense_ceremonie
                ADD COLUMN enregistre_par INT NULL
            `);
            results.push({ step: 'depense_ceremonie.enregistre_par', status: 'added' });
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                results.push({ step: 'depense_ceremonie.enregistre_par', status: 'already_exists' });
            } else {
                throw e;
            }
        }

        try {
            await db.execute(`
                ALTER TABLE depense_ceremonie
                ADD COLUMN libelle VARCHAR(200) NULL
            `);
            results.push({ step: 'depense_ceremonie.libelle', status: 'added' });
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                results.push({ step: 'depense_ceremonie.libelle', status: 'already_exists' });
            } else {
                throw e;
            }
        }

        try {
            await db.execute(`
                ALTER TABLE depense_ceremonie
                ADD COLUMN justificatif VARCHAR(255) NULL
            `);
            results.push({ step: 'depense_ceremonie.justificatif', status: 'added' });
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                results.push({ step: 'depense_ceremonie.justificatif', status: 'already_exists' });
            } else {
                throw e;
            }
        }

        // Migration 5: Créer les index (ignorer si existent)
        console.log('📝 Création des index...');
        try {
            await db.execute(`CREATE INDEX idx_cotisation_ceremonie ON cotisation_ceremonie(ceremonie_id)`);
            results.push({ step: 'idx_cotisation_ceremonie', status: 'created' });
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                results.push({ step: 'idx_cotisation_ceremonie', status: 'already_exists' });
            }
        }

        try {
            await db.execute(`CREATE INDEX idx_cotisation_membre ON cotisation_ceremonie(membre_id)`);
            results.push({ step: 'idx_cotisation_membre', status: 'created' });
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                results.push({ step: 'idx_cotisation_membre', status: 'already_exists' });
            }
        }

        console.log('✅ MIGRATION TERMINÉE AVEC SUCCÈS!');

        res.json({
            success: true,
            message: 'Migration des cotisations terminée avec succès',
            results
        });

    } catch (error) {
        console.error('❌ ERREUR MIGRATION:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            results
        });
    }
});

/**
 * POST /admin/cleanup-cotisation-data
 * Nettoyer les données de cotisation pour permettre une nouvelle activation
 */
router.post('/cleanup-cotisation-data', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const results = [];

        // 1. Supprimer les entrées de tresorier_ceremonie pour cette famille
        const [tresorierResult] = await db.execute(`
            DELETE tc FROM tresorier_ceremonie tc
            INNER JOIN ceremonie c ON tc.ceremonie_id = c.id
            WHERE c.famille_id = ?
        `, [familleId]);
        results.push({ table: 'tresorier_ceremonie', deleted: tresorierResult.affectedRows });

        // 2. Supprimer les cotisations pour cette famille
        const [cotisationResult] = await db.execute(`
            DELETE cc FROM cotisation_ceremonie cc
            INNER JOIN ceremonie c ON cc.ceremonie_id = c.id
            WHERE c.famille_id = ?
        `, [familleId]);
        results.push({ table: 'cotisation_ceremonie', deleted: cotisationResult.affectedRows });

        // 3. Réinitialiser les flags de cotisation sur les cérémonies
        const [ceremonieResult] = await db.execute(`
            UPDATE ceremonie
            SET necessite_cotisation = 0, montant_cotisation = 0
            WHERE famille_id = ?
        `, [familleId]);
        results.push({ table: 'ceremonie', updated: ceremonieResult.affectedRows });

        // 4. Supprimer les utilisateurs trésoriers créés pour cette famille
        const [utilisateurResult] = await db.execute(`
            DELETE FROM utilisateur
            WHERE famille_id = ? AND role = 'tresorier'
        `, [familleId]);
        results.push({ table: 'utilisateur (tresoriers)', deleted: utilisateurResult.affectedRows });

        console.log('✅ Nettoyage des données de cotisation terminé:', results);

        res.json({
            success: true,
            message: 'Données de cotisation nettoyées avec succès',
            results
        });

    } catch (error) {
        console.error('❌ Erreur nettoyage:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /admin/check-tables
 * Vérifier quelles tables existent
 */
router.get('/check-tables', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [tables] = await db.execute(`SHOW TABLES`);

        // Vérifier les colonnes de ceremonie
        let ceremonieColumns = [];
        try {
            const [cols] = await db.execute(`DESCRIBE ceremonie`);
            ceremonieColumns = cols.map(c => c.Field);
        } catch (e) {
            ceremonieColumns = ['Table not found'];
        }

        // Vérifier les colonnes de depense_ceremonie
        let depenseColumns = [];
        try {
            const [cols] = await db.execute(`DESCRIBE depense_ceremonie`);
            depenseColumns = cols.map(c => c.Field);
        } catch (e) {
            depenseColumns = ['Table not found'];
        }

        res.json({
            tables: tables.map(t => Object.values(t)[0]),
            ceremonieColumns,
            depenseColumns,
            hasCotisationTable: tables.some(t => Object.values(t)[0] === 'cotisation_ceremonie'),
            hasHistoriqueMdpTable: tables.some(t => Object.values(t)[0] === 'historique_mdp_tresorier')
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
