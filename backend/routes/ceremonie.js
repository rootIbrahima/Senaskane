// routes/ceremonie.js - Gestion des cérémonies familiales
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/ceremonie/ajouter
 * Ajouter une cérémonie familiale
 */
router.post('/ajouter', authenticateToken, requireAdmin, [
    body('typeCeremonie').isIn(['mariage', 'bapteme', 'deces', 'tour_famille', 'autre']),
    body('titre').notEmpty().withMessage('Le titre est requis'),
    body('dateCeremonie').isDate().withMessage('Date invalide')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const familleId = req.user.familleId;
        const { 
            typeCeremonie, titre, description, dateCeremonie, 
            lieu, membrePrincipalId, homonymeId 
        } = req.body;

        const [result] = await db.execute(
            `INSERT INTO ceremonie 
            (famille_id, type_ceremonie, titre, description, date_ceremonie, lieu, membre_principal_id, homonyme_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [familleId, typeCeremonie, titre, description, dateCeremonie, lieu, 
             membrePrincipalId || null, homonymeId || null]
        );

        const ceremonieId = result.insertId;

        // Ajouter les parrains/marraines si fournis
        if (req.body.parrains && Array.isArray(req.body.parrains)) {
            for (const parrain of req.body.parrains) {
                await db.execute(
                    'INSERT INTO parrain_marraine (ceremonie_id, membre_id, type_role) VALUES (?, ?, ?)',
                    [ceremonieId, parrain.membreId, parrain.role]
                );
            }
        }

        res.status(201).json({
            message: 'Cérémonie ajoutée avec succès',
            data: { id: ceremonieId }
        });

    } catch (error) {
        console.error('Erreur ajout cérémonie:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ceremonie/liste
 * Obtenir toutes les cérémonies de la famille
 */
router.get('/liste', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const { type, annee } = req.query;

        let query = `
            SELECT c.*, 
            m.nom as membre_nom, m.prenom as membre_prenom,
            h.nom as homonyme_nom, h.prenom as homonyme_prenom
            FROM ceremonie c
            LEFT JOIN membre m ON c.membre_principal_id = m.id
            LEFT JOIN membre h ON c.homonyme_id = h.id
            WHERE c.famille_id = ?
        `;
        
        const params = [familleId];

        if (type) {
            query += ' AND c.type_ceremonie = ?';
            params.push(type);
        }

        if (annee) {
            query += ' AND YEAR(c.date_ceremonie) = ?';
            params.push(annee);
        }

        query += ' ORDER BY c.date_ceremonie DESC';

        const [ceremonies] = await db.execute(query, params);

        // Récupérer les parrains/marraines pour chaque cérémonie
        for (let ceremonie of ceremonies) {
            const [parrains] = await db.execute(
                `SELECT pm.*, m.nom, m.prenom 
                FROM parrain_marraine pm
                JOIN membre m ON pm.membre_id = m.id
                WHERE pm.ceremonie_id = ?`,
                [ceremonie.id]
            );
            ceremonie.parrains = parrains;
        }

        res.json({ data: ceremonies });

    } catch (error) {
        console.error('Erreur récupération cérémonies:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ceremonie/:id
 * Obtenir les détails d'une cérémonie
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        const [ceremonies] = await db.execute(
            `SELECT c.*, 
            m.nom as membre_nom, m.prenom as membre_prenom, m.photo as membre_photo,
            h.nom as homonyme_nom, h.prenom as homonyme_prenom
            FROM ceremonie c
            LEFT JOIN membre m ON c.membre_principal_id = m.id
            LEFT JOIN membre h ON c.homonyme_id = h.id
            WHERE c.id = ? AND c.famille_id = ?`,
            [ceremonieId, familleId]
        );

        if (ceremonies.length === 0) {
            return res.status(404).json({ error: 'Cérémonie non trouvée' });
        }

        const ceremonie = ceremonies[0];

        // Récupérer les parrains/marraines
        const [parrains] = await db.execute(
            `SELECT pm.*, m.nom, m.prenom, m.photo 
            FROM parrain_marraine pm
            JOIN membre m ON pm.membre_id = m.id
            WHERE pm.ceremonie_id = ?`,
            [ceremonieId]
        );

        ceremonie.parrains = parrains;

        res.json({ data: ceremonie });

    } catch (error) {
        console.error('Erreur récupération cérémonie:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/ceremonie/:id
 * Mettre à jour une cérémonie
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        const updates = [];
        const values = [];

        const champs = ['titre', 'description', 'date_ceremonie', 'lieu'];
        
        champs.forEach(champ => {
            const camelCaseChamp = champ.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            if (req.body[camelCaseChamp] !== undefined) {
                updates.push(`${champ} = ?`);
                values.push(req.body[camelCaseChamp]);
            }
        });

        if (updates.length > 0) {
            values.push(ceremonieId, familleId);
            await db.execute(
                `UPDATE ceremonie SET ${updates.join(', ')} WHERE id = ? AND famille_id = ?`,
                values
            );
        }

        res.json({ message: 'Cérémonie mise à jour avec succès' });

    } catch (error) {
        console.error('Erreur mise à jour cérémonie:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/ceremonie/:id
 * Supprimer une cérémonie
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        await db.execute(
            'DELETE FROM ceremonie WHERE id = ? AND famille_id = ?',
            [ceremonieId, familleId]
        );

        res.json({ message: 'Cérémonie supprimée avec succès' });

    } catch (error) {
        console.error('Erreur suppression cérémonie:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== GESTION FINANCIÈRE ====================

/**
 * POST /api/ceremonie/:id/organisateur
 * Ajouter un organisateur à une cérémonie
 */
router.post('/:id/organisateur', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.id);
        const { membreId } = req.body;

        await db.execute(
            'INSERT INTO organisateur_ceremonie (ceremonie_id, membre_id) VALUES (?, ?)',
            [ceremonieId, membreId]
        );

        res.status(201).json({ message: 'Organisateur ajouté avec succès' });

    } catch (error) {
        console.error('Erreur ajout organisateur:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/ceremonie/:id/recette
 * Ajouter une recette (cotisation, don, etc.)
 */
router.post('/:id/recette', authenticateToken, requireAdmin, [
    body('typeRecette').isIn(['cotisation', 'don', 'autre']),
    body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
    body('dateRecette').isDate().withMessage('Date invalide')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const ceremonieId = parseInt(req.params.id);
        const { typeRecette, description, montant, contributeurNom, contributeurMembreId, dateRecette } = req.body;

        const [result] = await db.execute(
            `INSERT INTO recette_ceremonie
            (ceremonie_id, type_recette, description, montant, contributeur_nom, contributeur_membre_id, date_recette)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ceremonieId, typeRecette, description, montant, contributeurNom, contributeurMembreId || null, dateRecette]
        );

        res.status(201).json({
            message: 'Recette ajoutée avec succès',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Erreur ajout recette:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ceremonie/:id/recettes
 * Obtenir toutes les recettes d'une cérémonie
 */
router.get('/:id/recettes', authenticateToken, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.id);

        const [recettes] = await db.execute(
            `SELECT r.*, m.nom as membre_nom, m.prenom as membre_prenom
            FROM recette_ceremonie r
            LEFT JOIN membre m ON r.contributeur_membre_id = m.id
            WHERE r.ceremonie_id = ?
            ORDER BY r.date_recette DESC`,
            [ceremonieId]
        );

        res.json({ data: recettes });

    } catch (error) {
        console.error('Erreur récupération recettes:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/ceremonie/:id/recette/:recetteId
 * Supprimer une recette
 */
router.delete('/:id/recette/:recetteId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const recetteId = parseInt(req.params.recetteId);

        await db.execute('DELETE FROM recette_ceremonie WHERE id = ?', [recetteId]);

        res.json({ message: 'Recette supprimée avec succès' });

    } catch (error) {
        console.error('Erreur suppression recette:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/ceremonie/:id/depense
 * Ajouter une dépense
 */
router.post('/:id/depense', authenticateToken, requireAdmin, [
    body('rubrique').isIn(['bache', 'chaises', 'sonorisation', 'repas', 'honoraires', 'transport', 'habillement', 'autre']),
    body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
    body('dateDepense').isDate().withMessage('Date invalide')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const ceremonieId = parseInt(req.params.id);
        const { rubrique, description, montant, beneficiaire, dateDepense } = req.body;

        const [result] = await db.execute(
            `INSERT INTO depense_ceremonie
            (ceremonie_id, rubrique, description, montant, beneficiaire, date_depense)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [ceremonieId, rubrique, description, montant, beneficiaire, dateDepense]
        );

        res.status(201).json({
            message: 'Dépense ajoutée avec succès',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Erreur ajout dépense:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ceremonie/:id/depenses
 * Obtenir toutes les dépenses d'une cérémonie
 */
router.get('/:id/depenses', authenticateToken, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.id);

        const [depenses] = await db.execute(
            `SELECT * FROM depense_ceremonie
            WHERE ceremonie_id = ?
            ORDER BY date_depense DESC`,
            [ceremonieId]
        );

        res.json({ data: depenses });

    } catch (error) {
        console.error('Erreur récupération dépenses:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/ceremonie/:id/depense/:depenseId
 * Supprimer une dépense
 */
router.delete('/:id/depense/:depenseId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const depenseId = parseInt(req.params.depenseId);

        await db.execute('DELETE FROM depense_ceremonie WHERE id = ?', [depenseId]);

        res.json({ message: 'Dépense supprimée avec succès' });

    } catch (error) {
        console.error('Erreur suppression dépense:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ceremonie/:id/bilan
 * Obtenir le bilan financier d'une cérémonie (recettes, dépenses, solde)
 */
router.get('/:id/bilan', authenticateToken, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.id);

        // Total des recettes
        const [recettesResult] = await db.execute(
            'SELECT COALESCE(SUM(montant), 0) as total FROM recette_ceremonie WHERE ceremonie_id = ?',
            [ceremonieId]
        );

        // Total des dépenses
        const [depensesResult] = await db.execute(
            'SELECT COALESCE(SUM(montant), 0) as total FROM depense_ceremonie WHERE ceremonie_id = ?',
            [ceremonieId]
        );

        // Détails par type de recette
        const [recettesParType] = await db.execute(
            `SELECT type_recette, COALESCE(SUM(montant), 0) as total
            FROM recette_ceremonie
            WHERE ceremonie_id = ?
            GROUP BY type_recette`,
            [ceremonieId]
        );

        // Détails par rubrique de dépense
        const [depensesParRubrique] = await db.execute(
            `SELECT rubrique, COALESCE(SUM(montant), 0) as total
            FROM depense_ceremonie
            WHERE ceremonie_id = ?
            GROUP BY rubrique`,
            [ceremonieId]
        );

        const totalRecettes = parseFloat(recettesResult[0].total);
        const totalDepenses = parseFloat(depensesResult[0].total);
        const solde = totalRecettes - totalDepenses;

        res.json({
            data: {
                totalRecettes,
                totalDepenses,
                solde,
                recettesParType,
                depensesParRubrique
            }
        });

    } catch (error) {
        console.error('Erreur récupération bilan:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;