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

module.exports = router;