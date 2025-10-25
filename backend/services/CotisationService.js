// services/CotisationService.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class CotisationService {
    
    /**
     * Créer un compte trésorier pour une cérémonie
     */
    static async creerTresorier(ceremonieId, familleId, nomPrenom) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Générer un login unique
            const loginBase = `tresorier_${ceremonieId}`;
            const login = `${loginBase}_${Date.now()}`;

            // Générer un mot de passe temporaire
            const mdpTemporaire = crypto.randomBytes(4).toString('hex'); // 8 caractères
            const mdpHash = await bcrypt.hash(mdpTemporaire, 10);

            // Créer l'utilisateur trésorier
            const [result] = await connection.execute(
                `INSERT INTO utilisateur 
                (famille_id, login, mot_de_passe_hash, role, nom, est_active) 
                VALUES (?, ?, ?, 'tresorier', ?, TRUE)`,
                [familleId, login, mdpHash, nomPrenom]
            );

            const tresorierUserId = result.insertId;

            // Associer le trésorier à la cérémonie
            await connection.execute(
                'UPDATE ceremonie SET tresorier_id = ? WHERE id = ? AND famille_id = ?',
                [tresorierUserId, ceremonieId, familleId]
            );

            await connection.commit();

            return {
                userId: tresorierUserId,
                login: login,
                motDePasseTemporaire: mdpTemporaire
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Vérifier si c'est la première connexion du trésorier
     */
    static async estPremiereConnexion(userId, ceremonieId) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM historique_mdp_tresorier WHERE utilisateur_id = ? AND ceremonie_id = ?',
            [userId, ceremonieId]
        );
        return rows[0].count === 0;
    }

    /**
     * Changer le mot de passe du trésorier
     */
    static async changerMotDePasse(userId, ceremonieId, ancienMdp, nouveauMdp) {
        const connection = await db.getConnection();
        
        try {
            // Vérifier l'ancien mot de passe
            const [users] = await connection.execute(
                'SELECT mot_de_passe_hash FROM utilisateur WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                throw new Error('Utilisateur non trouvé');
            }

            const isValid = await bcrypt.compare(ancienMdp, users[0].mot_de_passe_hash);
            if (!isValid) {
                throw new Error('Ancien mot de passe incorrect');
            }

            // Hasher le nouveau mot de passe
            const nouveauMdpHash = await bcrypt.hash(nouveauMdp, 10);

            await connection.beginTransaction();

            // Mettre à jour le mot de passe
            await connection.execute(
                'UPDATE utilisateur SET mot_de_passe_hash = ? WHERE id = ?',
                [nouveauMdpHash, userId]
            );

            // Enregistrer dans l'historique
            const estPremier = await this.estPremiereConnexion(userId, ceremonieId);
            await connection.execute(
                'INSERT INTO historique_mdp_tresorier (utilisateur_id, ceremonie_id, est_premier_changement) VALUES (?, ?, ?)',
                [userId, ceremonieId, estPremier]
            );

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Initialiser les cotisations pour tous les membres de la famille
     */
    static async initialiserCotisations(ceremonieId, familleId, montantCotisation) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Récupérer tous les membres vivants de la famille
            const [membres] = await connection.execute(
                'SELECT id FROM membre WHERE famille_id = ? AND date_deces IS NULL',
                [familleId]
            );

            // Créer une cotisation pour chaque membre
            for (const membre of membres) {
                await connection.execute(
                    `INSERT INTO cotisation_ceremonie (ceremonie_id, membre_id, montant, a_cotise) 
                    VALUES (?, ?, ?, FALSE)`,
                    [ceremonieId, membre.id, montantCotisation]
                );
            }

            await connection.commit();
            return membres.length;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Calculer le résumé financier d'une cérémonie
     */
    static async calculerResume(ceremonieId) {
        // Total des cotisations attendues
        const [totalAttendu] = await db.execute(
            'SELECT SUM(montant) as total FROM cotisation_ceremonie WHERE ceremonie_id = ?',
            [ceremonieId]
        );

        // Total des cotisations reçues
        const [totalRecu] = await db.execute(
            'SELECT SUM(montant) as total FROM cotisation_ceremonie WHERE ceremonie_id = ? AND a_cotise = TRUE',
            [ceremonieId]
        );

        // Total des dépenses
        const [totalDepenses] = await db.execute(
            'SELECT SUM(montant) as total FROM depense_ceremonie WHERE ceremonie_id = ?',
            [ceremonieId]
        );

        // Nombre de membres ayant cotisé / total
        const [stats] = await db.execute(
            `SELECT 
                COUNT(*) as total_membres,
                SUM(CASE WHEN a_cotise = TRUE THEN 1 ELSE 0 END) as membres_ayant_cotise
            FROM cotisation_ceremonie 
            WHERE ceremonie_id = ?`,
            [ceremonieId]
        );

        const montantAttendu = parseFloat(totalAttendu[0].total || 0);
        const montantRecu = parseFloat(totalRecu[0].total || 0);
        const montantDepense = parseFloat(totalDepenses[0].total || 0);
        const soldeDisponible = montantRecu - montantDepense;

        return {
            montantAttendu,
            montantRecu,
            montantDepense,
            soldeDisponible,
            totalMembres: stats[0].total_membres,
            membresAyantCotise: stats[0].membres_ayant_cotise,
            tauxCotisation: stats[0].total_membres > 0 
                ? ((stats[0].membres_ayant_cotise / stats[0].total_membres) * 100).toFixed(2)
                : 0
        };
    }

    /**
     * Vérifier si une dépense peut être effectuée
     */
    static async verifierDisponibilite(ceremonieId, montantDepense) {
        const resume = await this.calculerResume(ceremonieId);
        
        if (montantDepense <= 0) {
            throw new Error('Le montant de la dépense doit être positif');
        }

        if (montantDepense > resume.soldeDisponible) {
            throw new Error(
                `Solde insuffisant. Disponible: ${resume.soldeDisponible} FCFA, Demandé: ${montantDepense} FCFA`
            );
        }

        return true;
    }

    /**
     * Enregistrer une cotisation
     */
    static async enregistrerCotisation(ceremonieId, membreId, data, tresorierUserId) {
        const { modePaiement, referencePaiement, notes } = data;

        // Vérifier que le montant de cotisation est positif
        const [cotisation] = await db.execute(
            'SELECT montant FROM cotisation_ceremonie WHERE ceremonie_id = ? AND membre_id = ?',
            [ceremonieId, membreId]
        );

        if (cotisation.length === 0) {
            throw new Error('Cotisation non trouvée pour ce membre');
        }

        if (cotisation[0].montant <= 0) {
            throw new Error('Le montant de cotisation doit être positif');
        }

        // Enregistrer la cotisation
        const [result] = await db.execute(
            `UPDATE cotisation_ceremonie 
            SET a_cotise = TRUE, 
                date_cotisation = NOW(), 
                mode_paiement = ?, 
                reference_paiement = ?,
                notes = ?,
                enregistre_par = ?
            WHERE ceremonie_id = ? AND membre_id = ?`,
            [modePaiement, referencePaiement, notes, tresorierUserId, ceremonieId, membreId]
        );

        return result.affectedRows > 0;
    }

    /**
     * Annuler une cotisation
     */
    static async annulerCotisation(ceremonieId, membreId) {
        const [result] = await db.execute(
            `UPDATE cotisation_ceremonie 
            SET a_cotise = FALSE, 
                date_cotisation = NULL, 
                mode_paiement = NULL, 
                reference_paiement = NULL,
                notes = NULL,
                enregistre_par = NULL
            WHERE ceremonie_id = ? AND membre_id = ?`,
            [ceremonieId, membreId]
        );

        return result.affectedRows > 0;
    }

    /**
     * Enregistrer une dépense
     */
    static async enregistrerDepense(ceremonieId, data, tresorierUserId) {
        const { libelle, montant, description, justificatif } = data;

        // Vérifier la disponibilité des fonds
        await this.verifierDisponibilite(ceremonieId, montant);

        const [result] = await db.execute(
            `INSERT INTO depense_ceremonie 
            (ceremonie_id, libelle, montant, description, justificatif, enregistre_par) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [ceremonieId, libelle, montant, description, justificatif, tresorierUserId]
        );

        return result.insertId;
    }
}

module.exports = CotisationService;