// routes/arbre.js - Gestion de l'arbre généalogique
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const Membre = require('../models/Membre');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/arbre/genealogique
 * Obtenir l'arbre généalogique complet
 */
router.get('/genealogique', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const arbre = await Membre.obtenirArbreFamilial(familleId);

        res.json({
            data: arbre,
            stats: {
                totalMembres: arbre.membres.length,
                totalLiens: arbre.liens.length
            }
        });

    } catch (error) {
        console.error('Erreur récupération arbre:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/arbre/liens
 * Ajouter un lien parental dans l'arbre
 */
router.post('/liens', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { enfantId, parentId, typeLien } = req.body;
        const familleId = req.user.familleId;

        if (!enfantId || !parentId || !typeLien) {
            return res.status(400).json({
                error: 'Les champs enfantId, parentId et typeLien sont requis'
            });
        }

        if (!['pere', 'mere'].includes(typeLien)) {
            return res.status(400).json({
                error: 'Le typeLien doit être "pere" ou "mere"'
            });
        }

        await Membre.ajouterLienParental(
            parseInt(enfantId),
            parseInt(parentId),
            typeLien,
            familleId
        );

        res.status(201).json({
            message: 'Lien parental ajouté avec succès',
            data: { enfantId, parentId, typeLien }
        });

    } catch (error) {
        console.error('Erreur ajout lien parental:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/arbre/liens/:id
 * Supprimer un lien parental
 */
router.delete('/liens/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const lienId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        // Vérifier que le lien appartient à la famille
        const [lien] = await db.execute(
            'SELECT * FROM lien_parental WHERE id = ? AND famille_id = ?',
            [lienId, familleId]
        );

        if (lien.length === 0) {
            return res.status(404).json({ error: 'Lien parental non trouvé' });
        }

        await db.execute('DELETE FROM lien_parental WHERE id = ?', [lienId]);

        res.json({ message: 'Lien parental supprimé avec succès' });

    } catch (error) {
        console.error('Erreur suppression lien parental:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
