// routes/famille.js - Gestion des informations de la famille
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/famille/info
 * Obtenir les informations de la famille
 */
router.get('/info', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;

        const [famille] = await db.execute(
            'SELECT * FROM famille WHERE id = ?',
            [familleId]
        );

        if (famille.length === 0) {
            return res.status(404).json({ error: 'Famille non trouvée' });
        }

        // Compter le nombre de membres
        const [stats] = await db.execute(
            'SELECT COUNT(*) as total_membres FROM membre WHERE famille_id = ?',
            [familleId]
        );

        res.json({ 
            data: {
                ...famille[0],
                totalMembres: stats[0].total_membres
            }
        });

    } catch (error) {
        console.error('Erreur récupération famille:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/famille/update
 * Mettre à jour les informations de la famille
 */
router.put('/update', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const { nom, slogan, lienWhatsapp } = req.body;

        const updates = [];
        const values = [];

        if (nom) {
            updates.push('nom = ?');
            values.push(nom);
        }

        if (slogan !== undefined) {
            updates.push('slogan = ?');
            values.push(slogan);
        }

        if (lienWhatsapp !== undefined) {
            updates.push('lien_whatsapp = ?');
            values.push(lienWhatsapp);
        }

        if (updates.length > 0) {
            values.push(familleId);
            await db.execute(
                `UPDATE famille SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        res.json({ message: 'Famille mise à jour avec succès' });

    } catch (error) {
        console.error('Erreur mise à jour famille:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/famille/logo
 * Uploader le logo de la famille
 */
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/logos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const logoUpload = multer({ 
    storage: logoStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Seules les images sont autorisées'));
    }
});

router.post('/logo', authenticateToken, requireAdmin, logoUpload.single('logo'), async (req, res) => {
    try {
        const familleId = req.user.familleId;

        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        await db.execute(
            'UPDATE famille SET logo = ? WHERE id = ?',
            [req.file.filename, familleId]
        );

        res.json({ 
            message: 'Logo mis à jour avec succès',
            data: { logo: req.file.filename }
        });

    } catch (error) {
        console.error('Erreur upload logo:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/famille/statistiques
 * Obtenir les statistiques de la famille
 */
router.get('/statistiques', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;

        // Nombre total de membres
        const [totalMembres] = await db.execute(
            'SELECT COUNT(*) as total FROM membre WHERE famille_id = ?',
            [familleId]
        );

        // Nombre d'hommes et de femmes
        const [parSexe] = await db.execute(
            'SELECT sexe, COUNT(*) as total FROM membre WHERE famille_id = ? GROUP BY sexe',
            [familleId]
        );

        // Nombre de cérémonies par type
        const [ceremonies] = await db.execute(
            'SELECT type_ceremonie, COUNT(*) as total FROM ceremonie WHERE famille_id = ? GROUP BY type_ceremonie',
            [familleId]
        );

        // Nombre d'objets dans le musée
        const [musee] = await db.execute(
            'SELECT COUNT(*) as total FROM musee_familial WHERE famille_id = ?',
            [familleId]
        );

        // Nombre de membres actifs (utilisateurs)
        const [membresActifs] = await db.execute(
            'SELECT COUNT(*) as total FROM utilisateur WHERE famille_id = ? AND est_active = TRUE',
            [familleId]
        );

        res.json({
            data: {
                totalMembres: totalMembres[0].total,
                parSexe: parSexe,
                ceremonies: ceremonies,
                objetsMusee: musee[0].total,
                membresActifs: membresActifs[0].total
            }
        });

    } catch (error) {
        console.error('Erreur récupération statistiques:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;