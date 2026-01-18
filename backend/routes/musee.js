// routes/musee.js - Gestion du musée familial
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database'); // Ajout pour les requêtes SQL
const { body, validationResult } = require('express-validator'); // Ajout pour la validation
const { authenticateToken, requireAdmin } = require('../middleware/auth'); // Ajout des middlewares

// Configuration de multer pour les objets du musée
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/musee/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'objet-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Format de fichier non autorisé'));
        }
    }
});

/**
 * GET /api/musee
 * Obtenir tous les objets du musée (route simplifiée)
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;

        const [objets] = await db.execute(
            `SELECT mf.*,
            m.nom as proprietaire_nom, m.prenom as proprietaire_prenom
            FROM musee_familial mf
            LEFT JOIN membre m ON mf.proprietaire_id = m.id
            WHERE mf.famille_id = ?
            ORDER BY mf.date_ajout DESC`,
            [familleId]
        );

        res.json({ data: objets });

    } catch (error) {
        console.error('Erreur récupération musée:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/musee
 * Ajouter un objet au musée (route simplifiée pour le frontend)
 */
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const familleId = req.user.familleId;

        // Accepter les champs en snake_case (frontend) ou camelCase (ancien code)
        const nomObjet = req.body.nom || req.body.nom_objet || req.body.nomObjet;
        const description = req.body.description || null;
        const proprietaireId = req.body.proprietaire_id || req.body.proprietaireId || null;

        // Convertir est_commun en booléen puis en entier pour MySQL
        const estCommunRaw = req.body.est_commun || req.body.estCommun;
        const estCommun = estCommunRaw === true || estCommunRaw === 'true' || estCommunRaw === '1' ? 1 : 0;

        // Validation
        if (!nomObjet) {
            return res.status(400).json({
                error: 'Le nom de l\'objet est requis'
            });
        }

        const imageUrl = req.file ? req.file.filename : null;

        const [result] = await db.execute(
            `INSERT INTO musee_familial
            (famille_id, nom_objet, description, image_url, proprietaire_id, est_commun)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [familleId, nomObjet, description, imageUrl, proprietaireId, estCommun]
        );

        res.status(201).json({
            message: 'Objet ajouté au musée avec succès',
            data: { id: result.insertId, imageUrl }
        });

    } catch (error) {
        console.error('Erreur ajout objet musée:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/musee/ajouter
 * Ajouter un objet au musée familial (ancienne route - compatibilité)
 */
router.post('/ajouter', authenticateToken, requireAdmin, upload.single('image'), [
    body('nomObjet').notEmpty().withMessage('Le nom de l\'objet est requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const familleId = req.user.familleId;
        const { nomObjet, description, proprietaireId } = req.body;

        // Convertir estCommun en entier pour MySQL
        const estCommunRaw = req.body.estCommun || req.body.est_commun;
        const estCommun = estCommunRaw === true || estCommunRaw === 'true' || estCommunRaw === '1' ? 1 : 0;

        const imageUrl = req.file ? req.file.filename : null;

        const [result] = await db.execute(
            `INSERT INTO musee_familial
            (famille_id, nom_objet, description, image_url, proprietaire_id, est_commun)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [familleId, nomObjet, description, imageUrl, proprietaireId || null, estCommun]
        );

        res.status(201).json({
            message: 'Objet ajouté au musée avec succès',
            data: { id: result.insertId, imageUrl }
        });

    } catch (error) {
        console.error('Erreur ajout objet musée:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/musee/liste
 * Obtenir tous les objets du musée familial
 */
router.get('/liste', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;

        const [objets] = await db.execute(
            `SELECT mf.*, 
            m.nom as proprietaire_nom, m.prenom as proprietaire_prenom
            FROM musee_familial mf
            LEFT JOIN membre m ON mf.proprietaire_id = m.id
            WHERE mf.famille_id = ?
            ORDER BY mf.date_ajout DESC`,
            [familleId]
        );

        res.json({ data: objets });

    } catch (error) {
        console.error('Erreur récupération musée:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/musee/:id
 * Obtenir les détails d'un objet du musée
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const objetId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        const [objets] = await db.execute(
            `SELECT mf.*, 
            m.nom as proprietaire_nom, m.prenom as proprietaire_prenom, m.photo as proprietaire_photo
            FROM musee_familial mf
            LEFT JOIN membre m ON mf.proprietaire_id = m.id
            WHERE mf.id = ? AND mf.famille_id = ?`,
            [objetId, familleId]
        );

        if (objets.length === 0) {
            return res.status(404).json({ error: 'Objet non trouvé' });
        }

        res.json({ data: objets[0] });

    } catch (error) {
        console.error('Erreur récupération objet:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/musee/:id
 * Mettre à jour un objet du musée
 */
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const objetId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        const updates = [];
        const values = [];

        if (req.body.nomObjet) {
            updates.push('nom_objet = ?');
            values.push(req.body.nomObjet);
        }

        if (req.body.description !== undefined) {
            updates.push('description = ?');
            values.push(req.body.description);
        }

        if (req.file) {
            updates.push('image_url = ?');
            values.push(req.file.filename);
        }

        if (updates.length > 0) {
            values.push(objetId, familleId);
            await db.execute(
                `UPDATE musee_familial SET ${updates.join(', ')} WHERE id = ? AND famille_id = ?`,
                values
            );
        }

        res.json({ message: 'Objet mis à jour avec succès' });

    } catch (error) {
        console.error('Erreur mise à jour objet:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/musee/:id
 * Supprimer un objet du musée
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const objetId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        await db.execute(
            'DELETE FROM musee_familial WHERE id = ? AND famille_id = ?',
            [objetId, familleId]
        );

        res.json({ message: 'Objet supprimé avec succès' });

    } catch (error) {
        console.error('Erreur suppression objet:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;