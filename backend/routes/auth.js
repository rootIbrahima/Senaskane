// routes/auth.js - Routes d'authentification
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Connexion utilisateur
router.post('/login', [
    body('login').notEmpty().withMessage('Le login est requis'),
    body('motDePasse').notEmpty().withMessage('Le mot de passe est requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { login, motDePasse } = req.body;

        // Vérifier si l'utilisateur existe
        const [users] = await db.execute(
            'SELECT u.*, f.nom as famille_nom FROM utilisateur u JOIN famille f ON u.famille_id = f.id WHERE u.login = ?',
            [login]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(motDePasse, user.mot_de_passe_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        // Vérifier si le compte est activé
        if (!user.est_active) {
            return res.status(401).json({ error: 'Compte non activé' });
        }

        // Vérifier si c'est un trésorier et si c'est sa première connexion
        let requirePasswordChange = false;
        let ceremonieId = null;

        if (user.role === 'tresorier') {
            // Trouver la cérémonie associée au trésorier
            const [ceremonies] = await db.execute(
                'SELECT id FROM ceremonie WHERE tresorier_id = ?',
                [user.id]
            );

            if (ceremonies.length > 0) {
                ceremonieId = ceremonies[0].id;

                // Vérifier si le mot de passe a déjà été changé
                const [historique] = await db.execute(
                    'SELECT COUNT(*) as count FROM historique_mdp_tresorier WHERE utilisateur_id = ? AND ceremonie_id = ?',
                    [user.id, ceremonieId]
                );

                requirePasswordChange = historique[0].count === 0;
            }
        }

        // Générer le token JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                familleId: user.famille_id, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        // Mettre à jour la dernière connexion
        await db.execute(
            'UPDATE utilisateur SET date_derniere_connexion = NOW() WHERE id = ?',
            [user.id]
        );

        res.json({
            token,
            utilisateur: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                famille: user.famille_nom,
                familleId: user.famille_id,
                requirePasswordChange,
                ceremonieId
            }
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Inscription (création de famille et admin)
router.post('/register', [
    body('nom_famille').notEmpty().withMessage('Le nom de la famille est requis'),
    body('login').notEmpty().withMessage('L\'identifiant est requis'),
    body('mot_de_passe').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nom_famille, login, mot_de_passe, nom, prenom, email, telephone } = req.body;

        // Vérifier si le login existe déjà
        const [existingUsers] = await db.execute(
            'SELECT id FROM utilisateur WHERE login = ?',
            [login]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Cet identifiant est déjà utilisé' });
        }

        // Hasher le mot de passe
        const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);

        // Créer la famille
        const [familleResult] = await db.execute(
            'INSERT INTO famille (nom, statut) VALUES (?, ?)',
            [nom_famille, 'actif']
        );

        const familleId = familleResult.insertId;

        // Créer l'utilisateur admin
        const [userResult] = await db.execute(
            'INSERT INTO utilisateur (famille_id, login, mot_de_passe_hash, role, nom, prenom, email, telephone, est_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [familleId, login, motDePasseHash, 'admin', nom, prenom, email || null, telephone || null, true]
        );

        const userId = userResult.insertId;

        // Générer le token JWT
        const token = jwt.sign(
            {
                userId: userId,
                familleId: familleId,
                role: 'admin'
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Inscription réussie',
            token,
            utilisateur: {
                id: userId,
                nom,
                prenom,
                login,
                role: 'admin',
                famille: nom_famille,
                familleId: familleId
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Activation de compte membre
router.post('/activer-compte', [
    body('codeActivation').notEmpty().withMessage('Le code d\'activation est requis'),
    body('nouveauMotDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
    try {
        const { codeActivation, nouveauMotDePasse } = req.body;

        const [users] = await db.execute(
            'SELECT * FROM utilisateur WHERE code_activation = ? AND est_active = FALSE',
            [codeActivation]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Code d\'activation invalide' });
        }

        const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 10);

        await db.execute(
            'UPDATE utilisateur SET mot_de_passe_hash = ?, est_active = TRUE, code_activation = NULL WHERE id = ?',
            [motDePasseHash, users[0].id]
        );

        res.json({ message: 'Compte activé avec succès' });

    } catch (error) {
        console.error('Erreur lors de l\'activation:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

/**
 * PUT /api/auth/change-password
 * Changer le mot de passe de l'utilisateur connecté
 */
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
        const userId = req.user.userId;

        // Validation
        if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
            return res.status(400).json({ error: 'Ancien et nouveau mots de passe requis' });
        }

        if (nouveau_mot_de_passe.length < 6) {
            return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
        }

        // Récupérer l'utilisateur
        const [users] = await db.execute(
            'SELECT id, mot_de_passe_hash FROM utilisateur WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = users[0];

        // Vérifier l'ancien mot de passe
        const validPassword = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
        }

        // Hasher le nouveau mot de passe
        const nouveauHash = await bcrypt.hash(nouveau_mot_de_passe, 10);

        // Mettre à jour le mot de passe
        await db.execute(
            'UPDATE utilisateur SET mot_de_passe_hash = ? WHERE id = ?',
            [nouveauHash, userId]
        );

        res.json({ message: 'Mot de passe modifié avec succès' });

    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

/**
 * POST /auth/code-famille
 * Connexion avec code d'accès famille (pas besoin de compte individuel)
 */
router.post('/code-famille', [
    body('codeAcces').notEmpty().withMessage('Le code d\'accès est requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { codeAcces } = req.body;

        // Rechercher la famille par code d'accès
        const [familles] = await db.execute(
            'SELECT id, nom_famille as nom, code_acces FROM famille WHERE code_acces = ?',
            [codeAcces.toUpperCase()]
        );

        if (familles.length === 0) {
            return res.status(401).json({ error: 'Code d\'accès invalide' });
        }

        const famille = familles[0];

        // Générer un token JWT pour accéder à la famille
        // Pas d'userId car pas de compte individuel, juste l'accès à la famille
        const token = jwt.sign(
            {
                familleId: famille.id,
                familleName: famille.nom,
                authMethod: 'code_famille'  // Indicateur que c'est une connexion par code
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '30d' }  // Token valide 30 jours
        );

        res.json({
            token,
            famille: {
                id: famille.id,
                nom: famille.nom
            }
        });

    } catch (error) {
        console.error('Erreur connexion par code famille:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

/**
 * POST /auth/generer-code/:familleId
 * Générer ou régénérer un code d'accès pour une famille (admin only)
 */
router.post('/generer-code/:familleId', authenticateToken, async (req, res) => {
    try {
        const { familleId } = req.params;

        // Générer un code unique
        function genererCodeAcces() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }

        let codeUnique = false;
        let code = '';

        // Générer jusqu'à avoir un code unique
        while (!codeUnique) {
            code = genererCodeAcces();
            const [existing] = await db.execute(
                'SELECT id FROM famille WHERE code_acces = ?',
                [code]
            );
            if (existing.length === 0) {
                codeUnique = true;
            }
        }

        // Mettre à jour le code de la famille
        await db.execute(
            'UPDATE famille SET code_acces = ? WHERE id = ?',
            [code, familleId]
        );

        res.json({
            code,
            message: 'Code d\'accès généré avec succès'
        });

    } catch (error) {
        console.error('Erreur génération code:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

/**
 * GET /auth/mon-code
 * Récupérer le code d'accès de ma famille
 */
router.get('/mon-code', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;

        if (!familleId) {
            return res.status(400).json({ error: 'familleId manquant dans le token. Veuillez vous reconnecter.' });
        }

        const [familles] = await db.execute(
            'SELECT code_acces, nom_famille FROM famille WHERE id = ?',
            [familleId]
        );

        if (familles.length === 0) {
            return res.status(404).json({ error: 'Famille non trouvée' });
        }

        const famille = familles[0];

        // Si pas de code, en générer un
        if (!famille.code_acces) {
            function genererCodeAcces() {
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                let code = '';
                for (let i = 0; i < 8; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return code;
            }

            let codeUnique = false;
            let code = '';

            while (!codeUnique) {
                code = genererCodeAcces();
                const [existing] = await db.execute(
                    'SELECT id FROM famille WHERE code_acces = ?',
                    [code]
                );
                if (existing.length === 0) {
                    codeUnique = true;
                }
            }

            await db.execute(
                'UPDATE famille SET code_acces = ? WHERE id = ?',
                [code, familleId]
            );

            famille.code_acces = code;
        }

        res.json({
            code: famille.code_acces,
            nomFamille: famille.nom_famille,
            lien: `${process.env.APP_URL || 'https://baila-genea.app'}/famille/${famille.code_acces}`
        });

    } catch (error) {
        console.error('Erreur récupération code:', error);
        console.error('Détails erreur:', error.message);
        console.error('Stack:', error.stack);

        // Si c'est une erreur SQL concernant la colonne code_acces
        if (error.message && error.message.includes('code_acces')) {
            return res.status(500).json({
                error: 'La colonne code_acces n\'existe pas. Migration non exécutée.',
                details: error.message
            });
        }

        res.status(500).json({
            error: 'Erreur interne du serveur',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;