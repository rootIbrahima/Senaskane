// routes/membre.js - Routes complètes pour la gestion des membres
const express = require('express');
const router = express.Router();
const Membre = require('../models/Membre');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/photos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seules les images JPEG et PNG sont autorisées'));
        }
    }
});

/**
 * POST /api/membre/ajouter
 * Ajouter un membre à l'arbre généalogique
 */
router.post('/ajouter', authenticateToken, requireAdmin, upload.single('photo'), async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const adminId = req.user.userId;

        // Validation des champs requis
        if (!req.body.nom || !req.body.prenom || !req.body.sexe) {
            return res.status(400).json({
                error: 'Les champs nom, prénom et sexe sont obligatoires'
            });
        }

        const donnesMembre = {
            familleId,
            nom: req.body.nom,
            prenom: req.body.prenom,
            sexe: req.body.sexe,
            dateNaissance: req.body.dateNaissance || null,
            lieuNaissance: req.body.lieuNaissance || null,
            profession: req.body.profession || null,
            lieuResidence: req.body.lieuResidence || null,
            nomConjoint: req.body.nomConjoint || null,
            photo: req.file ? req.file.filename : null,
            informationsSupplementaires: req.body.informationsSupplementaires || null,
            pereId: req.body.pereId ? parseInt(req.body.pereId) : null,
            mereId: req.body.mereId ? parseInt(req.body.mereId) : null
        };

        const membre = await Membre.ajouter(donnesMembre);

        // Ajouter les liens parentaux si fournis
        if (req.body.pereId) {
            await Membre.ajouterLienParental(
                membre.id,
                parseInt(req.body.pereId),
                'pere',
                familleId
            );
        }

        if (req.body.mereId) {
            await Membre.ajouterLienParental(
                membre.id,
                parseInt(req.body.mereId),
                'mere',
                familleId
            );
        }

        res.status(201).json({
            message: 'Membre ajouté avec succès',
            data: {
                id: membre.id,
                numeroIdentification: membre.numeroIdentification,
                nom: membre.nom,
                prenom: membre.prenom,
                sexe: membre.sexe,
                photo: membre.photo,
                dateNaissance: membre.dateNaissance,
                lieuNaissance: membre.lieuNaissance
            }
        });

    } catch (error) {
        console.error('Erreur ajout membre:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/membre/arbre
 * Obtenir l'arbre généalogique complet
 */
router.get('/arbre', authenticateToken, async (req, res) => {
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
 * GET /api/membre/liste
 * Liste simple de tous les membres (pour les sélecteurs)
 */
router.get('/liste', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        
        const [membres] = await db.execute(
            `SELECT id, numero_identification, nom, prenom, sexe, date_naissance, photo
            FROM membre 
            WHERE famille_id = ? 
            ORDER BY nom, prenom`,
            [familleId]
        );
        
        res.json({ data: membres });

    } catch (error) {
        console.error('Erreur récupération liste membres:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/membre/:id
 * Obtenir les détails d'un membre
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const membreId = parseInt(req.params.id);
        const familleId = req.user.familleId;
        
        const [membre] = await db.execute(
            `SELECT m.*, 
            p.id as pere_id, p.numero_identification as pere_numero, p.nom as pere_nom, p.prenom as pere_prenom,
            me.id as mere_id, me.numero_identification as mere_numero, me.nom as mere_nom, me.prenom as mere_prenom
            FROM membre m
            LEFT JOIN lien_parental lp_pere ON m.id = lp_pere.enfant_id AND lp_pere.type_lien = 'pere'
            LEFT JOIN membre p ON lp_pere.parent_id = p.id
            LEFT JOIN lien_parental lp_mere ON m.id = lp_mere.enfant_id AND lp_mere.type_lien = 'mere'
            LEFT JOIN membre me ON lp_mere.parent_id = me.id
            WHERE m.id = ? AND m.famille_id = ?`,
            [membreId, familleId]
        );

        if (membre.length === 0) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }

        // Récupérer les enfants
        const [enfants] = await db.execute(
            `SELECT m.* FROM membre m
            JOIN lien_parental lp ON m.id = lp.enfant_id
            WHERE lp.parent_id = ? AND m.famille_id = ?
            ORDER BY m.date_naissance`,
            [membreId, familleId]
        );

        // Récupérer les frères et sœurs
        const [fratrie] = await db.execute(
            `SELECT DISTINCT m.*
            FROM membre m
            JOIN lien_parental lp1 ON m.id = lp1.enfant_id
            JOIN lien_parental lp2 ON lp1.parent_id = lp2.parent_id
            WHERE lp2.enfant_id = ? AND m.id != ? AND m.famille_id = ?
            ORDER BY m.date_naissance`,
            [membreId, membreId, familleId]
        );

        res.json({ 
            data: {
                ...membre[0],
                enfants,
                fratrie
            }
        });

    } catch (error) {
        console.error('Erreur récupération membre:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/membre/:id
 * Mettre à jour un membre
 */
router.put('/:id', authenticateToken, requireAdmin, upload.single('photo'), async (req, res) => {
    try {
        const membreId = parseInt(req.params.id);
        const familleId = req.user.familleId;
        const adminId = req.user.userId;

        // Vérifier que le membre appartient à la famille
        const [membre] = await db.execute(
            'SELECT * FROM membre WHERE id = ? AND famille_id = ?',
            [membreId, familleId]
        );

        if (membre.length === 0) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }

        const updates = [];
        const values = [];

        const champs = ['nom', 'prenom', 'sexe', 'date_naissance', 'lieu_naissance',
                       'profession', 'lieu_residence', 'nom_conjoint', 'date_deces', 'lieu_deces',
                       'informations_supplementaires'];

        champs.forEach(champ => {
            const snakeCaseChamp = champ;
            const camelCaseChamp = champ.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

            if (req.body[camelCaseChamp] !== undefined) {
                updates.push(`${snakeCaseChamp} = ?`);
                values.push(req.body[camelCaseChamp]);
            }
        });

        if (req.file) {
            updates.push('photo = ?');
            values.push(req.file.filename);
        }

        if (updates.length > 0) {
            values.push(membreId);
            values.push(familleId);

            await db.execute(
                `UPDATE membre SET ${updates.join(', ')} WHERE id = ? AND famille_id = ?`,
                values
            );
        }

        res.json({
            message: 'Membre mis à jour avec succès'
        });

    } catch (error) {
        console.error('Erreur mise à jour membre:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/membre/:id
 * Supprimer un membre
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const membreId = parseInt(req.params.id);
        const familleId = req.user.familleId;

        await Membre.supprimer(membreId, familleId);

        res.json({ message: 'Membre supprimé avec succès' });

    } catch (error) {
        console.error('Erreur suppression membre:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/membre/lien-parental
 * Ajouter un lien parental (père ou mère)
 */
router.post('/lien-parental', authenticateToken, requireAdmin, async (req, res) => {
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
 * DELETE /api/membre/lien-parental/:id
 * Supprimer un lien parental
 */
router.delete('/lien-parental/:id', authenticateToken, requireAdmin, async (req, res) => {
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

/**
 * POST /api/membre/recherche/lien-parente
 * Rechercher le lien de parenté entre deux personnes
 */
router.post('/recherche/lien-parente', authenticateToken, async (req, res) => {
    try {
        const { membreId1, membreId2 } = req.body;
        const familleId = req.user.familleId;

        if (!membreId1 || !membreId2) {
            return res.status(400).json({ 
                error: 'Les deux identifiants de membres sont requis' 
            });
        }

        const lien = await Membre.trouverLienParente(
            familleId, 
            parseInt(membreId1), 
            parseInt(membreId2)
        );

        if (!lien) {
            return res.json({ 
                data: null,
                message: 'Aucun lien de parenté trouvé entre ces deux membres'
            });
        }

        res.json({ data: lien });

    } catch (error) {
        console.error('Erreur recherche lien parenté:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/membre/recherche/lieu/:lieu
 * Rechercher des membres par lieu
 */
router.get('/recherche/lieu/:lieu', authenticateToken, async (req, res) => {
    try {
        const lieu = req.params.lieu;
        const familleId = req.user.familleId;

        const membres = await Membre.rechercherParLieu(familleId, lieu);

        res.json({ 
            data: membres,
            total: membres.length
        });

    } catch (error) {
        console.error('Erreur recherche par lieu:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/membre/recherche/metier/:metier
 * Rechercher des membres par métier
 */
router.get('/recherche/metier/:metier', authenticateToken, async (req, res) => {
    try {
        const metier = req.params.metier;
        const familleId = req.user.familleId;

        const membres = await Membre.rechercherParMetier(familleId, metier);

        res.json({ 
            data: membres,
            total: membres.length
        });

    } catch (error) {
        console.error('Erreur recherche par métier:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/membre/recherche/nom/:nom
 * Rechercher des membres par nom
 */
router.get('/recherche/nom/:nom', authenticateToken, async (req, res) => {
    try {
        const nom = req.params.nom;
        const familleId = req.user.familleId;

        const membres = await Membre.rechercherParNom(familleId, nom);

        res.json({ 
            data: membres,
            total: membres.length
        });

    } catch (error) {
        console.error('Erreur recherche par nom:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;