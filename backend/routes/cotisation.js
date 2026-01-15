// routes/cotisation.js - Gestion des cotisations de cérémonie
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTresorier, requireAdminOrTresorier } = require('../middleware/auth');

const { body, validationResult } = require('express-validator');
const CotisationService = require('../services/CotisationService');

/**
 * POST /api/cotisation/activer
 * Activer les cotisations pour une cérémonie (Admin uniquement)
 */
router.post('/activer', authenticateToken, requireAdmin, [
    body('ceremonieId').isInt({ min: 1 }),
    body('montantCotisation').isFloat({ min: 0.01 }).withMessage('Le montant doit être positif'),
    body('tresorierMembreId').isInt({ min: 1 }).withMessage('Le membre trésorier est requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { ceremonieId, montantCotisation, tresorierMembreId } = req.body;
        const familleId = req.user.familleId;

        // Vérifier que la cérémonie appartient à la famille
        const [ceremonies] = await db.execute(
            'SELECT id FROM ceremonie WHERE id = ? AND famille_id = ?',
            [ceremonieId, familleId]
        );

        if (ceremonies.length === 0) {
            return res.status(404).json({ error: 'Cérémonie non trouvée' });
        }

        // Vérifier que le membre existe et appartient à la famille
        const [membres] = await db.execute(
            'SELECT id, nom, prenom, numero_identification FROM membre WHERE id = ? AND famille_id = ?',
            [tresorierMembreId, familleId]
        );

        if (membres.length === 0) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }

        const membre = membres[0];

        // Créer le compte trésorier
        const tresorier = await CotisationService.creerTresorier(
            ceremonieId,
            familleId,
            tresorierMembreId,
            `${membre.prenom} ${membre.nom}`
        );

        // Activer les cotisations
        await db.execute(
            'UPDATE ceremonie SET necessite_cotisation = TRUE, montant_cotisation = ? WHERE id = ?',
            [montantCotisation, ceremonieId]
        );

        // Initialiser les cotisations pour tous les membres
        const nombreMembres = await CotisationService.initialiserCotisations(
            ceremonieId, 
            familleId, 
            montantCotisation
        );

        res.status(201).json({
            message: 'Cotisations activées avec succès',
            data: {
                tresorier: {
                    login: tresorier.login,
                    motDePasseTemporaire: tresorier.motDePasseTemporaire
                },
                nombreMembres: nombreMembres,
                montantTotal: nombreMembres * montantCotisation
            }
        });

    } catch (error) {
        console.error('Erreur activation cotisations:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/cotisation/premier-connexion
 * Changer le mot de passe lors de la première connexion du trésorier
 */
router.post('/premier-connexion', authenticateToken, [
    body('ceremonieId').isInt({ min: 1 }),
    body('ancienMotDePasse').notEmpty(),
    body('nouveauMotDePasse').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { ceremonieId, ancienMotDePasse, nouveauMotDePasse } = req.body;
        const userId = req.user.userId; // CORRECTION ICI

        // Vérifier que c'est bien un trésorier
        if (req.user.role !== 'tresorier') {
            return res.status(403).json({ error: 'Accès réservé aux trésoriers' });
        }

        // Vérifier que c'est la première connexion
        const estPremier = await CotisationService.estPremiereConnexion(userId, ceremonieId);
        if (!estPremier) {
            return res.status(400).json({ error: 'Le mot de passe a déjà été changé' });
        }

        await CotisationService.changerMotDePasse(
            userId, 
            ceremonieId, 
            ancienMotDePasse, 
            nouveauMotDePasse
        );

        res.json({ message: 'Mot de passe changé avec succès' });

    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/cotisation/liste/:ceremonieId
 * Liste des cotisations pour une cérémonie (Trésorier ou Admin)
 */
router.get('/liste/:ceremonieId', authenticateToken, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.ceremonieId);
        const familleId = req.user.familleId;

        // Vérifier les permissions
        const [ceremonie] = await db.execute(
            'SELECT id FROM ceremonie WHERE id = ? AND famille_id = ?',
            [ceremonieId, familleId]
        );

        if (ceremonie.length === 0) {
            return res.status(404).json({ error: 'Cérémonie non trouvée' });
        }

        // Récupérer le trésorier de cette cérémonie
        const [tresorier] = await db.execute(
            'SELECT utilisateur_id FROM tresorier_ceremonie WHERE ceremonie_id = ?',
            [ceremonieId]
        );

        const estAutorise = req.user.role === 'admin' ||
                           (req.user.role === 'tresorier' && tresorier.length > 0 && req.user.userId === tresorier[0].utilisateur_id);

        if (!estAutorise) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Récupérer la liste des cotisations
        const [cotisations] = await db.execute(
            `SELECT c.*, m.nom, m.prenom, m.photo,
             u.nom as enregistre_par_nom
             FROM cotisation_ceremonie c
             JOIN membre m ON c.membre_id = m.id
             LEFT JOIN utilisateur u ON c.enregistre_par = u.id
             WHERE c.ceremonie_id = ?
             ORDER BY m.nom, m.prenom`,
            [ceremonieId]
        );

        // Calculer le résumé
        const resume = await CotisationService.calculerResume(ceremonieId);

        res.json({ 
            data: {
                cotisations,
                resume
            }
        });

    } catch (error) {
        console.error('Erreur récupération cotisations:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/cotisation/enregistrer
 * Enregistrer qu'un membre a cotisé (Trésorier uniquement)
 */
router.post('/enregistrer', authenticateToken, requireAdminOrTresorier, [
    body('ceremonieId').isInt({ min: 1 }).withMessage('ID de cérémonie invalide'),
    body('membreId').isInt({ min: 1 }).withMessage('ID de membre invalide'),
    body('modePaiement').notEmpty().withMessage('Mode de paiement requis'),
    body('referencePaiement').optional().isString().withMessage('Référence de paiement doit être une chaîne'),
    body('notes').optional({ nullable: true }).isString().withMessage('Notes doivent être une chaîne ou null')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { ceremonieId, membreId, modePaiement, referencePaiement, notes } = req.body;
        const tresorierUserId = req.user.userId;

        const result = await CotisationService.enregistrerCotisation(
            ceremonieId,
            membreId,
            { modePaiement, referencePaiement, notes },
            tresorierUserId
        );

        if (result) {
            res.json({ message: 'Cotisation enregistrée avec succès' });
        } else {
            res.status(400).json({ error: 'Échec de l\'enregistrement de la cotisation' });
        }
    } catch (error) {
        console.error('Erreur enregistrement cotisation:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/cotisation/annuler
 * Annuler une cotisation (Trésorier uniquement)
 */
router.post('/annuler', authenticateToken, requireTresorier, [
    body('ceremonieId').isInt({ min: 1 }),
    body('membreId').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { ceremonieId, membreId } = req.body;

        await CotisationService.annulerCotisation(ceremonieId, membreId);

        res.json({ message: 'Cotisation annulée avec succès' });

    } catch (error) {
        console.error('Erreur annulation cotisation:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/cotisation/depense/ajouter
 * Ajouter une dépense (Trésorier uniquement)
 */
/**
 * POST /api/cotisation/depense/ajouter
 * Enregistrer une dépense pour une cérémonie (Trésorier ou Admin)
 */
router.post('/depense/ajouter', authenticateToken, requireAdminOrTresorier, [
    body('ceremonieId').isInt({ min: 1 }).withMessage('ID de cérémonie invalide'),
    body('libelle').notEmpty().withMessage('Le libellé est requis'),
    body('montant').isFloat({ min: 0.01 }).withMessage('Le montant doit être positif'),
    body('description').optional({ nullable: true }).isString().withMessage('Description doit être une chaîne ou null'),
    body('justificatif').optional({ nullable: true }).isString().withMessage('Justificatif doit être une chaîne ou null')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { ceremonieId, libelle, montant, description, justificatif } = req.body;
        const familleId = req.user.familleId;
        const tresorierUserId = req.user.userId;

        // Vérifier que la cérémonie appartient à la famille
        const [ceremonies] = await db.execute(
            'SELECT id FROM ceremonie WHERE id = ? AND famille_id = ?',
            [ceremonieId, familleId]
        );

        if (ceremonies.length === 0) {
            return res.status(404).json({ error: 'Cérémonie non trouvée' });
        }

        // Enregistrer la dépense
        const depenseId = await CotisationService.enregistrerDepense(
            ceremonieId,
            { libelle, montant, description, justificatif },
            tresorierUserId
        );

        res.status(201).json({
            message: 'Dépense enregistrée avec succès',
            depenseId
        });

    } catch (error) {
        console.error('Erreur enregistrement dépense:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * GET /api/cotisation/depenses/:ceremonieId
 * Liste des dépenses pour une cérémonie
 */
router.get('/depenses/:ceremonieId', authenticateToken, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.ceremonieId);
        const familleId = req.user.familleId;

        // Vérifier les permissions
        const [ceremonie] = await db.execute(
            'SELECT id FROM ceremonie WHERE id = ? AND famille_id = ?',
            [ceremonieId, familleId]
        );

        if (ceremonie.length === 0) {
            return res.status(404).json({ error: 'Cérémonie non trouvée' });
        }

        // Récupérer le trésorier de cette cérémonie
        const [tresorier] = await db.execute(
            'SELECT utilisateur_id FROM tresorier_ceremonie WHERE ceremonie_id = ?',
            [ceremonieId]
        );

        const estAutorise = req.user.role === 'admin' ||
                           (req.user.role === 'tresorier' && tresorier.length > 0 && req.user.userId === tresorier[0].utilisateur_id);

        if (!estAutorise) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Récupérer les dépenses
        const [depenses] = await db.execute(
            `SELECT d.*, u.nom as enregistre_par_nom
             FROM depense_ceremonie d
             JOIN utilisateur u ON d.enregistre_par = u.id
             WHERE d.ceremonie_id = ?
             ORDER BY d.date_depense DESC`,
            [ceremonieId]
        );

        res.json({ data: depenses });

    } catch (error) {
        console.error('Erreur récupération dépenses:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/cotisation/resume/:ceremonieId
 * Résumé financier d'une cérémonie
 */
router.get('/resume/:ceremonieId', authenticateToken, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.ceremonieId);
        const familleId = req.user.familleId;

        // Vérifier que la cérémonie existe
        const [ceremonie] = await db.execute(
            'SELECT id FROM ceremonie WHERE id = ? AND famille_id = ?',
            [ceremonieId, familleId]
        );

        if (ceremonie.length === 0) {
            return res.status(404).json({ error: 'Cérémonie non trouvée' });
        }

        const resume = await CotisationService.calculerResume(ceremonieId);

        res.json({ data: resume });

    } catch (error) {
        console.error('Erreur calcul résumé:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/cotisation/export/cotisations/:ceremonieId
 * Exporter les cotisations en PDF
 */
router.get('/export/cotisations/:ceremonieId', authenticateToken, requireAdminOrTresorier, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.ceremonieId);
        const familleId = req.user.familleId;

        // Récupérer les informations de la cérémonie
        const [ceremonies] = await db.execute(
            'SELECT * FROM ceremonie WHERE id = ? AND famille_id = ?',
            [ceremonieId, familleId]
        );

        if (ceremonies.length === 0) {
            return res.status(404).json({ error: 'Cérémonie non trouvée' });
        }

        const ceremonie = ceremonies[0];

        // Récupérer les cotisations
        const [cotisations] = await db.execute(
            `SELECT c.*, m.nom, m.prenom
             FROM cotisation_ceremonie c
             JOIN membre m ON c.membre_id = m.id
             WHERE c.ceremonie_id = ?
             ORDER BY m.nom, m.prenom`,
            [ceremonieId]
        );

        // Calculer le résumé
        const resume = await CotisationService.calculerResume(ceremonieId);

        // Générer le PDF
        const PDFService = require('../services/PDFService');
        const pdfBuffer = await PDFService.genererPDFCotisations(ceremonie, cotisations, resume);

        // Envoyer le PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cotisations_${ceremonie.titre.replace(/\s+/g, '_')}_${Date.now()}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur export PDF cotisations:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/cotisation/export/depenses/:ceremonieId
 * Exporter les dépenses en PDF
 */
router.get('/export/depenses/:ceremonieId', authenticateToken, requireAdminOrTresorier, async (req, res) => {
    try {
        const ceremonieId = parseInt(req.params.ceremonieId);
        const familleId = req.user.familleId;

        // Récupérer les informations de la cérémonie
        const [ceremonies] = await db.execute(
            'SELECT * FROM ceremonie WHERE id = ? AND famille_id = ?',
            [ceremonieId, familleId]
        );

        if (ceremonies.length === 0) {
            return res.status(404).json({ error: 'Cérémonie non trouvée' });
        }

        const ceremonie = ceremonies[0];

        // Récupérer les dépenses
        const [depenses] = await db.execute(
            `SELECT d.*, u.nom as enregistre_par_nom
             FROM depense_ceremonie d
             JOIN utilisateur u ON d.enregistre_par = u.id
             WHERE d.ceremonie_id = ?
             ORDER BY d.date_depense DESC`,
            [ceremonieId]
        );

        // Calculer le résumé
        const resume = await CotisationService.calculerResume(ceremonieId);

        // Générer le PDF
        const PDFService = require('../services/PDFService');
        const pdfBuffer = await PDFService.genererPDFDepenses(ceremonie, depenses, resume);

        // Envoyer le PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="depenses_${ceremonie.titre.replace(/\s+/g, '_')}_${Date.now()}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur export PDF dépenses:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;