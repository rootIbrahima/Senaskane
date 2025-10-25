// routes/bandePassante.js - Gestion de la bande passante (messages admin)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database'); // Ajout pour les requêtes SQL
const { body, validationResult } = require('express-validator'); // Ajout pour la validation
const { authenticateToken, requireAdmin } = require('../middleware/auth'); // Ajout des middlewares

/**
 * POST /api/bande-passante/publier
 * Publier un message sur la bande passante (admin uniquement)
 */
router.post('/publier', authenticateToken, requireAdmin, [
    body('contenu').notEmpty().withMessage('Le contenu est requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const familleId = req.user.familleId;
        const adminId = req.user.userId;
        const { titre, contenu } = req.body;

        const [result] = await db.execute(
            `INSERT INTO bande_passante (famille_id, admin_id, titre, contenu) 
            VALUES (?, ?, ?, ?)`,
            [familleId, adminId, titre, contenu]
        );

        res.status(201).json({
            message: 'Message publié avec succès',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Erreur publication message:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/bande-passante/liste
 * Obtenir tous les messages de la bande passante
 */
router.get('/liste', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const [messages] = await db.execute(
            `SELECT bp.*, u.nom as admin_nom, u.prenom as admin_prenom
            FROM bande_passante bp
            JOIN utilisateur u ON bp.admin_id = u.id
            WHERE bp.famille_id = ? AND bp.est_actif = TRUE
            ORDER BY bp.date_publication DESC
            LIMIT ? OFFSET ?`,
            [familleId, limit, offset]
        );

        res.json({ data: messages });

    } catch (error) {
        console.error('Erreur récupération messages:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/bande-passante/:id
 * Obtenir un message spécifique
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        const [messages] = await db.execute(
            `SELECT bp.*, u.nom as admin_nom, u.prenom as admin_prenom
            FROM bande_passante bp
            JOIN utilisateur u ON bp.admin_id = u.id
            WHERE bp.id = ? AND bp.famille_id = ?`,
            [messageId, familleId]
        );

        if (messages.length === 0) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        res.json({ data: messages[0] });

    } catch (error) {
        console.error('Erreur récupération message:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/bande-passante/:id
 * Mettre à jour un message
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const familleId = req.user.familleId;
        const adminId = req.user.userId;

        // Vérifier que le message appartient bien à cet admin
        const [message] = await db.execute(
            'SELECT * FROM bande_passante WHERE id = ? AND famille_id = ? AND admin_id = ?',
            [messageId, familleId, adminId]
        );

        if (message.length === 0) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        const updates = [];
        const values = [];

        if (req.body.titre !== undefined) {
            updates.push('titre = ?');
            values.push(req.body.titre);
        }

        if (req.body.contenu !== undefined) {
            updates.push('contenu = ?');
            values.push(req.body.contenu);
        }

        if (updates.length > 0) {
            values.push(messageId);
            await db.execute(
                `UPDATE bande_passante SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        res.json({ message: 'Message mis à jour avec succès' });

    } catch (error) {
        console.error('Erreur mise à jour message:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/bande-passante/:id
 * Désactiver un message (soft delete)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const familleId = req.user.familleId;
        const adminId = req.user.userId;

        await db.execute(
            'UPDATE bande_passante SET est_actif = FALSE WHERE id = ? AND famille_id = ? AND admin_id = ?',
            [messageId, familleId, adminId]
        );

        res.json({ message: 'Message désactivé avec succès' });

    } catch (error) {
        console.error('Erreur suppression message:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;