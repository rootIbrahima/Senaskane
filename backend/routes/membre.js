// routes/membre.js - Routes complètes pour la gestion des membres
const express = require('express');
const router = express.Router();
const Membre = require('../models/Membre');
const InvitationService = require('../services/InvitationService');
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
            informationsSupplementaires: req.body.informationsSupplementaires || null
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

        // Créer automatiquement un compte utilisateur si email ou téléphone est fourni
        let compteUtilisateur = null;
        if (req.body.email || req.body.telephone) {
            try {
                const invitationData = await InvitationService.creerInvitation(
                    adminId,
                    familleId,
                    {
                        nom: req.body.nom,
                        prenom: req.body.prenom,
                        email: req.body.email || null,
                        telephone: req.body.telephone || null
                    }
                );

                compteUtilisateur = {
                    login: invitationData.login,
                    motDePasse: invitationData.motDePasseTemp,
                    codeActivation: invitationData.codeActivation
                };

                console.log(`✅ Compte utilisateur créé pour ${req.body.prenom} ${req.body.nom}`);
                console.log(`   Login: ${invitationData.login}`);
                console.log(`   Mot de passe: ${invitationData.motDePasseTemp}`);
                console.log(`   Code activation: ${invitationData.codeActivation}`);

                // Envoyer l'invitation par email/SMS si possible
                if (req.body.email) {
                    try {
                        await InvitationService.envoyerInvitation(invitationData.utilisateurId, 'email');
                        console.log(`📧 Invitation envoyée par email à ${req.body.email}`);
                    } catch (emailError) {
                        console.error('❌ Erreur envoi email:', emailError.message);
                    }
                } else if (req.body.telephone) {
                    try {
                        await InvitationService.envoyerInvitation(invitationData.utilisateurId, 'sms');
                        console.log(`📱 Invitation envoyée par SMS à ${req.body.telephone}`);
                    } catch (smsError) {
                        console.error('❌ Erreur envoi SMS:', smsError.message);
                    }
                }

            } catch (invitationError) {
                console.error('⚠️ Erreur création compte utilisateur:', invitationError.message);
                // On continue même si la création du compte échoue
            }
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
                lieuNaissance: membre.lieuNaissance,
                compteUtilisateur: compteUtilisateur
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

        // Créer automatiquement un compte utilisateur si email ou téléphone est fourni
        // et qu'il n'existe pas déjà un compte pour ce membre
        let compteUtilisateur = null;
        if (req.body.email || req.body.telephone) {
            try {
                // Vérifier si un compte existe déjà pour ce membre
                const [existingUser] = await db.execute(
                    'SELECT id FROM utilisateur WHERE nom = ? AND prenom = ? AND famille_id = ?',
                    [req.body.nom || membre[0].nom, req.body.prenom || membre[0].prenom, familleId]
                );

                if (existingUser.length === 0) {
                    const invitationData = await InvitationService.creerInvitation(
                        adminId,
                        familleId,
                        {
                            nom: req.body.nom || membre[0].nom,
                            prenom: req.body.prenom || membre[0].prenom,
                            email: req.body.email || null,
                            telephone: req.body.telephone || null
                        }
                    );

                    compteUtilisateur = {
                        login: invitationData.login,
                        motDePasse: invitationData.motDePasseTemp,
                        codeActivation: invitationData.codeActivation
                    };

                    console.log(`✅ Compte utilisateur créé pour ${req.body.prenom || membre[0].prenom} ${req.body.nom || membre[0].nom}`);
                    console.log(`   Login: ${invitationData.login}`);
                    console.log(`   Mot de passe: ${invitationData.motDePasseTemp}`);
                    console.log(`   Code activation: ${invitationData.codeActivation}`);

                    // Envoyer l'invitation par email/SMS si possible
                    if (req.body.email) {
                        try {
                            await InvitationService.envoyerInvitation(invitationData.utilisateurId, 'email');
                            console.log(`📧 Invitation envoyée par email à ${req.body.email}`);
                        } catch (emailError) {
                            console.error('❌ Erreur envoi email:', emailError.message);
                        }
                    } else if (req.body.telephone) {
                        try {
                            await InvitationService.envoyerInvitation(invitationData.utilisateurId, 'sms');
                            console.log(`📱 Invitation envoyée par SMS à ${req.body.telephone}`);
                        } catch (smsError) {
                            console.error('❌ Erreur envoi SMS:', smsError.message);
                        }
                    }
                } else {
                    console.log(`ℹ️ Un compte utilisateur existe déjà pour ce membre`);
                }
            } catch (invitationError) {
                console.error('⚠️ Erreur création compte utilisateur:', invitationError.message);
                // On continue même si la création du compte échoue
            }
        }

        res.json({
            message: 'Membre mis à jour avec succès',
            data: {
                compteUtilisateur: compteUtilisateur
            }
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

/**
 * POST /api/membre/mariage
 * Ajouter un mariage entre deux membres
 */
router.post('/mariage', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const { conjoint1Id, conjoint2Id, dateMariage, lieuMariage, statut } = req.body;

        // Validation
        if (!conjoint1Id || !conjoint2Id) {
            return res.status(400).json({ error: 'Les deux conjoints sont requis' });
        }

        if (conjoint1Id === conjoint2Id) {
            return res.status(400).json({ error: 'Un membre ne peut pas se marier avec lui-même' });
        }

        // Vérifier que les deux membres appartiennent à la même famille
        const [conjoint1] = await db.execute(
            'SELECT id, famille_id FROM membre WHERE id = ?',
            [conjoint1Id]
        );
        const [conjoint2] = await db.execute(
            'SELECT id, famille_id FROM membre WHERE id = ?',
            [conjoint2Id]
        );

        if (conjoint1.length === 0 || conjoint2.length === 0) {
            return res.status(404).json({ error: 'Un ou plusieurs membres introuvables' });
        }

        if (conjoint1[0].famille_id !== familleId || conjoint2[0].famille_id !== familleId) {
            return res.status(403).json({ error: 'Les membres doivent appartenir à votre famille' });
        }

        // Vérifier qu'un mariage n'existe pas déjà entre ces deux personnes
        const [existing] = await db.execute(
            `SELECT id FROM mariage
             WHERE (conjoint1_id = ? AND conjoint2_id = ?)
                OR (conjoint1_id = ? AND conjoint2_id = ?)`,
            [conjoint1Id, conjoint2Id, conjoint2Id, conjoint1Id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Un mariage existe déjà entre ces deux membres' });
        }

        // Insérer le mariage
        const [result] = await db.execute(
            `INSERT INTO mariage
             (famille_id, conjoint1_id, conjoint2_id, date_mariage, lieu_mariage, statut)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [familleId, conjoint1Id, conjoint2Id, dateMariage || null, lieuMariage || null, statut || 'actif']
        );

        res.status(201).json({
            message: 'Mariage ajouté avec succès',
            data: {
                id: result.insertId,
                conjoint1_id: conjoint1Id,
                conjoint2_id: conjoint2Id,
                date_mariage: dateMariage,
                lieu_mariage: lieuMariage,
                statut: statut || 'actif'
            }
        });

    } catch (error) {
        console.error('Erreur ajout mariage:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/membre/mariage/:id
 * Supprimer un mariage
 */
router.delete('/mariage/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const mariageId = req.params.id;
        const familleId = req.user.familleId;

        // Vérifier que le mariage appartient à la famille
        const [mariage] = await db.execute(
            'SELECT id, famille_id FROM mariage WHERE id = ?',
            [mariageId]
        );

        if (mariage.length === 0) {
            return res.status(404).json({ error: 'Mariage introuvable' });
        }

        if (mariage[0].famille_id !== familleId) {
            return res.status(403).json({ error: 'Ce mariage n\'appartient pas à votre famille' });
        }

        // Supprimer le mariage
        await db.execute('DELETE FROM mariage WHERE id = ?', [mariageId]);

        res.json({ message: 'Mariage supprimé avec succès' });

    } catch (error) {
        console.error('Erreur suppression mariage:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/membre/mariage/:id
 * Modifier un mariage (statut, date, lieu)
 */
router.put('/mariage/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const mariageId = req.params.id;
        const familleId = req.user.familleId;
        const { dateMariage, lieuMariage, statut, dateFin } = req.body;

        // Vérifier que le mariage appartient à la famille
        const [mariage] = await db.execute(
            'SELECT id, famille_id FROM mariage WHERE id = ?',
            [mariageId]
        );

        if (mariage.length === 0) {
            return res.status(404).json({ error: 'Mariage introuvable' });
        }

        if (mariage[0].famille_id !== familleId) {
            return res.status(403).json({ error: 'Ce mariage n\'appartient pas à votre famille' });
        }

        // Mettre à jour le mariage
        await db.execute(
            `UPDATE mariage
             SET date_mariage = COALESCE(?, date_mariage),
                 lieu_mariage = COALESCE(?, lieu_mariage),
                 statut = COALESCE(?, statut),
                 date_fin = ?
             WHERE id = ?`,
            [dateMariage, lieuMariage, statut, dateFin, mariageId]
        );

        res.json({ message: 'Mariage mis à jour avec succès' });

    } catch (error) {
        console.error('Erreur modification mariage:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;