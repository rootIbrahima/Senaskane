// routes/auth.js - Routes d'authentification
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

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
            user: {
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

module.exports = router;