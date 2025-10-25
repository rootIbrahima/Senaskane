// models/Famille.js - Modèle pour la gestion des familles
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Famille {
    static async creer(nom, logo, slogan) {
        try {
            const [result] = await db.execute(
                'INSERT INTO famille (nom, logo, slogan) VALUES (?, ?, ?)',
                [nom, logo, slogan]
            );
            
            return {
                id: result.insertId,
                nom,
                logo,
                slogan
            };
        } catch (error) {
            throw new Error('Erreur lors de la création de la famille: ' + error.message);
        }
    }

    static async creerAdministrateur(familleId, nom, prenom, email, telephone) {
        try {
            // Générer un mot de passe temporaire
            const motDePasseTemp = Math.random().toString(36).slice(-8);
            const motDePasseHash = await bcrypt.hash(motDePasseTemp, 10);
            
            // Générer un code d'activation
            const codeActivation = Math.random().toString(36).slice(-6).toUpperCase();
            
            // Créer le login (ex: admin.sall)
            const [famille] = await db.execute('SELECT nom FROM famille WHERE id = ?', [familleId]);
            const login = `admin.${famille[0].nom.toLowerCase()}`;

            const [result] = await db.execute(
                `INSERT INTO utilisateur 
                (famille_id, login, mot_de_passe_hash, role, nom, prenom, email, telephone, code_activation) 
                VALUES (?, ?, ?, 'admin', ?, ?, ?, ?, ?)`,
                [familleId, login, motDePasseHash, nom, prenom, email, telephone, codeActivation]
            );

            return {
                id: result.insertId,
                login,
                motDePasseTemp,
                codeActivation
            };
        } catch (error) {
            throw new Error('Erreur lors de la création de l\'administrateur: ' + error.message);
        }
    }

    static async obtenirParId(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM famille WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Erreur lors de la récupération de la famille: ' + error.message);
        }
    }

    static async mettreAJour(id, nom, logo, slogan, lienWhatsapp) {
        try {
            await db.execute(
                'UPDATE famille SET nom = ?, logo = ?, slogan = ?, lien_whatsapp = ? WHERE id = ?',
                [nom, logo, slogan, lienWhatsapp, id]
            );
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la mise à jour: ' + error.message);
        }
    }
}

module.exports = Famille;
