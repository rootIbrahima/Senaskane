// routes/invitation.js - Routes pour la gestion des invitations
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const InvitationService = require('../services/InvitationService');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/invitation/creer
 * Créer une invitation pour un nouveau membre
 */
router.post('/creer', authenticateToken, requireAdmin, [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('telephone').optional().isMobilePhone('any'),
    body('email').optional().isEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nom, prenom, email, telephone } = req.body;
        const adminId = req.user.userId;
        const familleId = req.user.familleId;

        // Vérifier qu'au moins un moyen de communication est fourni
        if (!email && !telephone) {
            return res.status(400).json({ 
                error: 'Au moins un email ou un téléphone est requis' 
            });
        }

        const invitation = await InvitationService.creerInvitation(
            adminId,
            familleId,
            { nom, prenom, email, telephone }
        );

        // Tenter d'envoyer l'invitation (sans bloquer si ça échoue)
        const moyenCommunication = email ? 'email' : 'sms';
        const resultatEnvoi = await InvitationService.envoyerInvitation(
            invitation.utilisateurId,
            moyenCommunication
        );

        // Toujours retourner succès avec les credentials, même si l'envoi a échoué
        const response = {
            message: resultatEnvoi.emailSent || resultatEnvoi.smsSent
                ? `Invitation créée et envoyée avec succès par ${resultatEnvoi.moyen}`
                : 'Invitation créée avec succès',
            data: {
                login: invitation.login,
                codeActivation: invitation.codeActivation,
                nom: resultatEnvoi.credentials.nom,
                prenom: resultatEnvoi.credentials.prenom,
                email: resultatEnvoi.credentials.email,
                telephone: resultatEnvoi.credentials.telephone
            },
            notification: {
                emailSent: resultatEnvoi.emailSent,
                smsSent: resultatEnvoi.smsSent,
                error: resultatEnvoi.error
            }
        };

        // Si l'envoi a échoué, ajouter un avertissement
        if (resultatEnvoi.error) {
            response.warning = `L'invitation n'a pas pu être envoyée (${resultatEnvoi.error}). Veuillez communiquer les identifiants manuellement au membre.`;
        }

        res.status(201).json(response);

    } catch (error) {
        console.error('Erreur création invitation:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/invitation/liste
 * Obtenir la liste des membres invités
 */
router.get('/liste', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const membres = await InvitationService.obtenirMembresInvites(familleId);
        
        res.json({ data: membres });

    } catch (error) {
        console.error('Erreur récupération membres:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/invitation/renvoyer/:utilisateurId
 * Renvoyer une invitation
 */
router.post('/renvoyer/:utilisateurId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const adminId = req.user.userId;
        const utilisateurId = parseInt(req.params.utilisateurId);

        await InvitationService.renvoyerInvitation(adminId, utilisateurId);

        res.json({ message: 'Invitation renvoyée avec succès' });

    } catch (error) {
        console.error('Erreur renvoi invitation:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/invitation/:utilisateurId
 * Supprimer une invitation non activée
 */
router.delete('/:utilisateurId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const adminId = req.user.userId;
        const utilisateurId = parseInt(req.params.utilisateurId);

        await InvitationService.supprimerInvitation(adminId, utilisateurId);

        res.json({ message: 'Invitation supprimée avec succès' });

    } catch (error) {
        console.error('Erreur suppression invitation:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;