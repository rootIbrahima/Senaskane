// services/InvitationService.js - Service de gestion des invitations
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class InvitationService {
    
    /**
     * Créer une invitation pour un membre de la famille
     */
    static async creerInvitation(adminId, familleId, donnesMembre) {
        try {
            const { nom, prenom, email, telephone } = donnesMembre;
            
            // Vérifier que l'utilisateur est bien admin de cette famille
            const [admin] = await db.execute(
                'SELECT * FROM utilisateur WHERE id = ? AND famille_id = ? AND role = "admin"',
                [adminId, familleId]
            );
            
            if (admin.length === 0) {
                throw new Error('Accès non autorisé');
            }

            // Générer un code d'activation unique
            const codeActivation = crypto.randomBytes(3).toString('hex').toUpperCase();
            
            // Générer un mot de passe temporaire
            const motDePasseTemp = crypto.randomBytes(4).toString('hex');
            const motDePasseHash = await bcrypt.hash(motDePasseTemp, 10);
            
            // Créer le login basé sur le nom de famille
            const [famille] = await db.execute('SELECT nom FROM famille WHERE id = ?', [familleId]);
            const loginBase = `${prenom.toLowerCase()}.${famille[0].nom.toLowerCase()}`;
            
            // Vérifier l'unicité du login
            let login = loginBase;
            let compteur = 1;
            while (true) {
                const [existing] = await db.execute('SELECT id FROM utilisateur WHERE login = ?', [login]);
                if (existing.length === 0) break;
                login = `${loginBase}${compteur}`;
                compteur++;
            }

            // Insérer le nouvel utilisateur
            const [result] = await db.execute(
                `INSERT INTO utilisateur 
                (famille_id, login, mot_de_passe_hash, role, nom, prenom, email, telephone, code_activation, est_active) 
                VALUES (?, ?, ?, 'membre', ?, ?, ?, ?, ?, FALSE)`,
                [familleId, login, motDePasseHash, nom, prenom, email, telephone, codeActivation]
            );

            return {
                utilisateurId: result.insertId,
                login,
                codeActivation,
                motDePasseTemp
            };
            
        } catch (error) {
            throw new Error('Erreur lors de la création de l\'invitation: ' + error.message);
        }
    }

    /**
     * Envoyer l'invitation par SMS ou Email
     */
    static async envoyerInvitation(utilisateurId, moyenCommunication = 'sms') {
        try {
            const [utilisateur] = await db.execute(
                `SELECT u.*, f.nom as famille_nom 
                FROM utilisateur u 
                JOIN famille f ON u.famille_id = f.id 
                WHERE u.id = ?`,
                [utilisateurId]
            );

            if (utilisateur.length === 0) {
                throw new Error('Utilisateur non trouvé');
            }

            const user = utilisateur[0];
            
            const message = `
Bonjour ${user.prenom} ${user.nom},

Bienvenue dans l'application Senaskane pour la famille ${user.famille_nom}!

Vos identifiants:
Login: ${user.login}
Code d'activation: ${user.code_activation}

Téléchargez l'application Senaskane et utilisez ce code pour activer votre compte.
            `.trim();

            let resultat = { success: false, moyen: moyenCommunication };

            if (moyenCommunication === 'email' && user.email) {
                try {
                    await this.envoyerEmail(user.email, 'Invitation Senaskane', message);
                    resultat.success = true;
                    console.log(`✅ Email envoyé avec succès à ${user.email}`);
                } catch (error) {
                    console.error('❌ Erreur envoi email:', error.message);
                    throw error;
                }
            } else if (moyenCommunication === 'sms' && user.telephone) {
                try {
                    await this.envoyerSMS(user.telephone, message);
                    resultat.success = true;
                    console.log(`✅ SMS envoyé avec succès à ${user.telephone}`);
                } catch (error) {
                    console.error('❌ Erreur envoi SMS:', error.message);
                    // Essayer l'email en fallback si disponible
                    if (user.email) {
                        console.log('🔄 Tentative d\'envoi par email en fallback...');
                        await this.envoyerEmail(user.email, 'Invitation Senaskane', message);
                        resultat.moyen = 'email';
                        resultat.success = true;
                    } else {
                        throw error;
                    }
                }
            } else {
                throw new Error(`Moyen de communication non disponible: ${moyenCommunication}`);
            }

            return resultat;

        } catch (error) {
            throw new Error('Erreur lors de l\'envoi de l\'invitation: ' + error.message);
        }
    }

    /**
     * Envoyer un SMS (à adapter selon le fournisseur SMS)
     */
    static async envoyerSMS(telephone, message) {
        // IMPORTANT: Vous devez intégrer un service SMS réel
        // Options pour le Sénégal:
        // - Orange SMS API
        // - Twilio
        // - Nexmo/Vonage
        // - Africa's Talking
        
        console.log('📱 [SMS SIMULÉ] Envoi à:', telephone);
        console.log('Message:', message);
        
        // TODO: Décommenter et configurer quand vous avez un service SMS
        /*
        // Exemple avec Africa's Talking
        const AfricasTalking = require('africastalking');
        const africastalking = AfricasTalking({
            apiKey: process.env.SMS_API_KEY,
            username: process.env.SMS_USERNAME
        });
        
        const sms = africastalking.SMS;
        const result = await sms.send({
            to: [telephone],
            message: message,
            from: 'Senaskane'
        });
        
        return result;
        */
        
        // Pour le moment, on simule un succès
        return { success: true, simulated: true };
    }

    /**
     * Envoyer un Email avec nodemailer
     */
    static async envoyerEmail(email, sujet, message) {
        try {
            console.log('📧 Tentative d\'envoi d\'email à:', email);
            console.log('📧 Configuration SMTP:', {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER
            });

            // Configuration du transporteur SMTP
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: false, // true pour le port 465, false pour les autres ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Vérifier la connexion
            console.log('🔄 Vérification de la connexion SMTP...');
            await transporter.verify();
            console.log('✅ Connexion SMTP établie');

            // Créer le message HTML
            const messageHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #2c5530; color: white; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
                        .credentials { background: white; padding: 20px; border-left: 4px solid #2c5530; margin: 20px 0; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
                        .button { display: inline-block; padding: 12px 30px; background: #2c5530; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🌳 Senaskane</h1>
                        </div>
                        <div class="content">
                            ${message.split('\n').map(line => `<p>${line}</p>`).join('')}
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                            <p>&copy; 2025 Senaskane - Plateforme de gestion familiale</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Envoyer l'email
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Senaskane" <noreply@senaskane.com>',
                to: email,
                subject: sujet,
                text: message,
                html: messageHtml
            });

            console.log('✅ Email envoyé:', info.messageId);
            return info;

        } catch (error) {
            console.error('❌ Erreur détaillée envoi email:', error);
            throw new Error(`Échec envoi email: ${error.message}`);
        }
    }

    /**
     * Obtenir tous les membres invités d'une famille
     */
    static async obtenirMembresInvites(familleId) {
        try {
            const [membres] = await db.execute(
                `SELECT id, login, nom, prenom, email, telephone, est_active, 
                date_derniere_connexion, created_at 
                FROM utilisateur 
                WHERE famille_id = ? AND role = 'membre'
                ORDER BY nom, prenom`,
                [familleId]
            );
            
            return membres;
        } catch (error) {
            throw new Error('Erreur lors de la récupération des membres: ' + error.message);
        }
    }

    /**
     * Réenvoyer une invitation
     */
    static async renvoyerInvitation(adminId, utilisateurId) {
        try {
            // Vérifier les permissions
            const [user] = await db.execute(
                `SELECT u1.*, u2.famille_id as admin_famille_id
                FROM utilisateur u1
                JOIN utilisateur u2 ON u1.famille_id = u2.famille_id
                WHERE u1.id = ? AND u2.id = ? AND u2.role = 'admin'`,
                [utilisateurId, adminId]
            );

            if (user.length === 0) {
                throw new Error('Accès non autorisé');
            }

            // Générer un nouveau code d'activation si le compte n'est pas encore activé
            if (!user[0].est_active) {
                const nouveauCode = crypto.randomBytes(3).toString('hex').toUpperCase();
                await db.execute(
                    'UPDATE utilisateur SET code_activation = ? WHERE id = ?',
                    [nouveauCode, utilisateurId]
                );
            }

            // Déterminer le moyen de communication
            const moyenCommunication = user[0].email ? 'email' : 'sms';

            // Envoyer l'invitation
            await this.envoyerInvitation(utilisateurId, moyenCommunication);

            return true;
        } catch (error) {
            throw new Error('Erreur lors du renvoi de l\'invitation: ' + error.message);
        }
    }

    /**
     * Supprimer une invitation (avant activation)
     */
    static async supprimerInvitation(adminId, utilisateurId) {
        try {
            // Vérifier les permissions et que le compte n'est pas activé
            const [user] = await db.execute(
                `SELECT u1.*, u2.famille_id as admin_famille_id
                FROM utilisateur u1
                JOIN utilisateur u2 ON u1.famille_id = u2.famille_id
                WHERE u1.id = ? AND u2.id = ? AND u2.role = 'admin' AND u1.est_active = FALSE`,
                [utilisateurId, adminId]
            );

            if (user.length === 0) {
                throw new Error('Impossible de supprimer cette invitation');
            }

            await db.execute('DELETE FROM utilisateur WHERE id = ?', [utilisateurId]);

            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression: ' + error.message);
        }
    }
}

module.exports = InvitationService;