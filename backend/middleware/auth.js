// middleware/auth.js - Middleware d'authentification et d'autorisation
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware d'authentification par JWT
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    const secret = process.env.JWT_SECRET || 'senaskane-super-secret-key-2026-production';

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide ou expiré' });
        }
        req.user = user; // {userId, familleId, role}
        next();
    });
};

/**
 * Middleware pour vérifier que l'utilisateur est admin
 */
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Accès réservé aux administrateurs' 
        });
    }
    next();
};

/**
 * Middleware pour vérifier que l'utilisateur est trésorier
 */
const requireTresorier = async (req, res, next) => {
    if (req.user.role !== 'tresorier') {
        return res.status(403).json({ 
            error: 'Accès refusé. Privilèges trésorier requis.' 
        });
    }

    // Vérifier si le trésorier doit changer son mot de passe
    try {
        const ceremonieId = req.body.ceremonieId || req.params.ceremonieId;
        
        if (ceremonieId) {
            const [historique] = await db.execute(
                'SELECT COUNT(*) as count FROM historique_mdp_tresorier WHERE utilisateur_id = ? AND ceremonie_id = ?',
                [req.user.userId, ceremonieId]
            );

            // Si c'est la première connexion et que ce n'est pas la route de changement de mot de passe
            if (historique[0].count === 0 && !req.path.includes('premier-connexion')) {
                return res.status(403).json({ 
                    error: 'Vous devez changer votre mot de passe lors de votre première connexion',
                    requirePasswordChange: true
                });
            }
        }

        next();
    } catch (error) {
        console.error('Erreur vérification trésorier:', error);
        return res.status(500).json({ error: 'Erreur de vérification' });
    }
};

/**
 * Middleware pour vérifier que l'utilisateur est admin ou trésorier
 */
const requireAdminOrTresorier = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'tresorier') {
        return res.status(403).json({ 
            error: 'Accès refusé. Privilèges administrateur ou trésorier requis.' 
        });
    }
    next();
};

module.exports = { 
    authenticateToken, 
    requireAdmin, 
    requireTresorier,
    requireAdminOrTresorier 
};