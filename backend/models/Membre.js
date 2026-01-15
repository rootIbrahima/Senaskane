// models/Membre.js - Modèle pour la gestion des membres
const db = require('../config/database');

class Membre {
    /**
     * Générer un numéro d'identification simple pour un membre
     * Format simple: FAM{familleId}-001, FAM{familleId}-002, FAM{familleId}-003, ...
     * Tous les membres de la famille ont un numéro séquentiel simple
     *
     * @param {number} familleId - ID de la famille
     * @param {number|null} pereId - ID du père (non utilisé, gardé pour compatibilité)
     * @param {number|null} mereId - ID de la mère (non utilisé, gardé pour compatibilité)
     * @returns {string} Numéro d'identification simple
     */
    static async genererNumeroIdentification(familleId, pereId = null, mereId = null) {
        try {
            // Préfixe de famille
            const famillePrefix = `FAM${familleId}-`;

            // Trouver le numéro maximum existant pour cette famille
            const [maxNumero] = await db.execute(`
                SELECT numero_identification
                FROM membre
                WHERE famille_id = ?
                AND numero_identification LIKE ?
                ORDER BY CAST(SUBSTRING(numero_identification, LENGTH(?) + 1) AS UNSIGNED) DESC
                LIMIT 1
            `, [familleId, `${famillePrefix}%`, famillePrefix]);

            let compteur = 1;
            if (maxNumero.length > 0) {
                // Extraire le numéro du dernier membre
                const dernierNumero = maxNumero[0].numero_identification;
                const match = dernierNumero.match(/FAM\d+-(\d+)/);
                if (match) {
                    compteur = parseInt(match[1]) + 1;
                }
            }

            return `${famillePrefix}${String(compteur).padStart(3, '0')}`; // FAM7-001, FAM7-002, FAM7-003, ...
        } catch (error) {
            throw new Error('Erreur lors de la génération du numéro d\'identification: ' + error.message);
        }
    }

    static async ajouter(donnesMembre) {
        try {
            const {
                familleId, nom, prenom, sexe, dateNaissance, lieuNaissance,
                profession, lieuResidence, nomConjoint, photo, informationsSupplementaires,
                pereId, mereId
            } = donnesMembre;

            // Générer le numéro d'identification hiérarchique
            const numeroIdentification = await this.genererNumeroIdentification(familleId, pereId, mereId);

            const [result] = await db.execute(
                `INSERT INTO membre 
                (famille_id, numero_identification, nom, prenom, sexe, date_naissance, lieu_naissance, 
                profession, lieu_residence, nom_conjoint, photo, informations_supplementaires) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [familleId, numeroIdentification, nom, prenom, sexe, dateNaissance, lieuNaissance,
                profession, lieuResidence, nomConjoint, photo, informationsSupplementaires]
            );

            return {
                id: result.insertId,
                numeroIdentification,
                ...donnesMembre
            };
        } catch (error) {
            throw new Error('Erreur lors de l\'ajout du membre: ' + error.message);
        }
    }

    static async ajouterLienParental(enfantId, parentId, typeLien, familleId) {
        try {
            // Vérifier que les deux membres appartiennent à la même famille
            const [verification] = await db.execute(
                `SELECT 
                    (SELECT COUNT(*) FROM membre WHERE id = ? AND famille_id = ?) as enfant_valide,
                    (SELECT COUNT(*) FROM membre WHERE id = ? AND famille_id = ?) as parent_valide`,
                [enfantId, familleId, parentId, familleId]
            );

            if (verification[0].enfant_valide === 0 || verification[0].parent_valide === 0) {
                throw new Error('Un ou plusieurs membres n\'appartiennent pas à cette famille');
            }

            // Vérifier qu'il n'y a pas déjà un lien identique
            const [existing] = await db.execute(
                'SELECT id FROM lien_parental WHERE enfant_id = ? AND parent_id = ? AND type_lien = ?',
                [enfantId, parentId, typeLien]
            );

            if (existing.length > 0) {
                throw new Error('Ce lien parental existe déjà');
            }

            await db.execute(
                'INSERT INTO lien_parental (enfant_id, parent_id, type_lien, famille_id) VALUES (?, ?, ?, ?)',
                [enfantId, parentId, typeLien, familleId]
            );
            
            return true;
        } catch (error) {
            throw new Error('Erreur lors de l\'ajout du lien parental: ' + error.message);
        }
    }

    static async obtenirArbreFamilial(familleId) {
        try {
            // Récupérer tous les membres
            const [membres] = await db.execute(
                'SELECT * FROM membre WHERE famille_id = ? ORDER BY nom, prenom',
                [familleId]
            );

            // Récupérer tous les liens parentaux
            const [liensParentaux] = await db.execute(
                `SELECT lp.*,
                m1.nom as enfant_nom, m1.prenom as enfant_prenom, m1.numero_identification as enfant_numero,
                m2.nom as parent_nom, m2.prenom as parent_prenom, m2.numero_identification as parent_numero
                FROM lien_parental lp
                JOIN membre m1 ON lp.enfant_id = m1.id
                JOIN membre m2 ON lp.parent_id = m2.id
                WHERE lp.famille_id = ?`,
                [familleId]
            );

            // Récupérer tous les mariages/unions
            let mariages = [];
            try {
                const [mariagesResult] = await db.execute(
                    `SELECT m.*,
                    m1.nom as conjoint1_nom, m1.prenom as conjoint1_prenom, m1.numero_identification as conjoint1_numero,
                    m2.nom as conjoint2_nom, m2.prenom as conjoint2_prenom, m2.numero_identification as conjoint2_numero
                    FROM mariage m
                    JOIN membre m1 ON m.conjoint1_id = m1.id
                    JOIN membre m2 ON m.conjoint2_id = m2.id
                    WHERE m.famille_id = ?`,
                    [familleId]
                );
                mariages = mariagesResult;
            } catch (error) {
                // Table mariage n'existe peut-être pas encore
                console.warn('Table mariage non disponible:', error.message);
            }

            return {
                membres,
                liens: liensParentaux,
                mariages
            };
        } catch (error) {
            throw new Error('Erreur lors de la récupération de l\'arbre: ' + error.message);
        }
    }

    static async rechercherParLieu(familleId, lieu) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM membre 
                WHERE famille_id = ? AND 
                (lieu_naissance LIKE ? OR lieu_residence LIKE ?)
                ORDER BY nom, prenom`,
                [familleId, `%${lieu}%`, `%${lieu}%`]
            );
            return rows;
        } catch (error) {
            throw new Error('Erreur lors de la recherche par lieu: ' + error.message);
        }
    }

    static async rechercherParMetier(familleId, metier) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM membre 
                WHERE famille_id = ? AND profession LIKE ?
                ORDER BY nom, prenom`,
                [familleId, `%${metier}%`]
            );
            return rows;
        } catch (error) {
            throw new Error('Erreur lors de la recherche par métier: ' + error.message);
        }
    }

    static async rechercherParNom(familleId, nomRecherche) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM membre 
                WHERE famille_id = ? AND 
                (nom LIKE ? OR prenom LIKE ? OR CONCAT(prenom, ' ', nom) LIKE ?)
                ORDER BY nom, prenom`,
                [familleId, `%${nomRecherche}%`, `%${nomRecherche}%`, `%${nomRecherche}%`]
            );
            return rows;
        } catch (error) {
            throw new Error('Erreur lors de la recherche par nom: ' + error.message);
        }
    }

    static async trouverLienParente(familleId, membreId1, membreId2) {
        try {
            // Récupérer les informations complètes des deux membres
            const [membre1Info] = await db.execute(
                'SELECT id, numero_identification, nom, prenom, sexe FROM membre WHERE id = ?',
                [membreId1]
            );
            const [membre2Info] = await db.execute(
                'SELECT id, numero_identification, nom, prenom, sexe FROM membre WHERE id = ?',
                [membreId2]
            );

            if (!membre1Info.length || !membre2Info.length) {
                throw new Error('Un ou plusieurs membres non trouvés');
            }

            const sexeMembre1 = membre1Info[0].sexe;
            const sexeMembre2 = membre2Info[0].sexe;

            // Algorithme pour trouver le chemin entre deux membres
            // Implémentation d'un parcours en largeur (BFS) pour trouver l'ancêtre commun

            const query = `
                WITH RECURSIVE arbre_ascendant1 AS (
                    SELECT id, numero_identification, nom, prenom, 0 as niveau, CAST(id AS CHAR(1000)) as chemin
                    FROM membre WHERE id = ? AND famille_id = ?
                    UNION ALL
                    SELECT m.id, m.numero_identification, m.nom, m.prenom, aa.niveau + 1,
                           CONCAT(aa.chemin, ',', m.id) as chemin
                    FROM membre m
                    JOIN lien_parental lp ON m.id = lp.parent_id
                    JOIN arbre_ascendant1 aa ON lp.enfant_id = aa.id
                    WHERE aa.niveau < 10
                ),
                arbre_ascendant2 AS (
                    SELECT id, numero_identification, nom, prenom, 0 as niveau, CAST(id AS CHAR(1000)) as chemin
                    FROM membre WHERE id = ? AND famille_id = ?
                    UNION ALL
                    SELECT m.id, m.numero_identification, m.nom, m.prenom, aa.niveau + 1,
                           CONCAT(aa.chemin, ',', m.id) as chemin
                    FROM membre m
                    JOIN lien_parental lp ON m.id = lp.parent_id
                    JOIN arbre_ascendant2 aa ON lp.enfant_id = aa.id
                    WHERE aa.niveau < 10
                )
                SELECT aa1.*, aa2.niveau as niveau2, aa2.chemin as chemin2
                FROM arbre_ascendant1 aa1
                JOIN arbre_ascendant2 aa2 ON aa1.id = aa2.id
                ORDER BY aa1.niveau + aa2.niveau
                LIMIT 1
            `;

            const [result] = await db.execute(query, [membreId1, familleId, membreId2, familleId]);

            if (result.length > 0) {
                const ancetreCommun = result[0];
                const degre = ancetreCommun.niveau + ancetreCommun.niveau2;

                // Construire les chemins avec détails des membres
                const chemin1Ids = ancetreCommun.chemin.split(',').map(id => parseInt(id));
                const chemin2Ids = ancetreCommun.chemin2.split(',').map(id => parseInt(id));

                // Récupérer les détails de tous les membres dans les chemins
                const allIds = [...new Set([...chemin1Ids, ...chemin2Ids])];
                const placeholders = allIds.map(() => '?').join(',');
                const [membresDetails] = await db.execute(
                    `SELECT id, numero_identification, nom, prenom, sexe
                     FROM membre WHERE id IN (${placeholders})`,
                    allIds
                );

                // Créer un map pour accéder rapidement aux détails
                const membresMap = {};
                membresDetails.forEach(m => {
                    membresMap[m.id] = m;
                });

                // Construire chemin1 avec détails
                const chemin1 = chemin1Ids.map(id => ({
                    id: membresMap[id].id,
                    numero: membresMap[id].numero_identification,
                    nom: membresMap[id].nom,
                    prenom: membresMap[id].prenom,
                    sexe: membresMap[id].sexe
                }));

                // Construire chemin2 avec détails
                const chemin2 = chemin2Ids.map(id => ({
                    id: membresMap[id].id,
                    numero: membresMap[id].numero_identification,
                    nom: membresMap[id].nom,
                    prenom: membresMap[id].prenom,
                    sexe: membresMap[id].sexe
                }));

                return {
                    ancetreCommun: {
                        id: ancetreCommun.id,
                        numero: ancetreCommun.numero_identification,
                        nom: ancetreCommun.nom,
                        prenom: ancetreCommun.prenom
                    },
                    degre: degre,
                    description: this.decrireLienParente(ancetreCommun.niveau, ancetreCommun.niveau2, sexeMembre1, sexeMembre2),
                    chemin1: chemin1, // Chemin de membre1 à l'ancêtre commun
                    chemin2: chemin2  // Chemin de membre2 à l'ancêtre commun
                };
            }

            return null;
        } catch (error) {
            throw new Error('Erreur lors de la recherche de lien de parenté: ' + error.message);
        }
    }

    /**
     * Décrire le lien de parenté en langage naturel
     * @param niveau1 - distance de membre1 à l'ancêtre commun
     * @param niveau2 - distance de membre2 à l'ancêtre commun
     * @param sexeMembre1 - sexe du membre1 ('M' ou 'F')
     * @param sexeMembre2 - sexe du membre2 ('M' ou 'F')
     */
    static decrireLienParente(niveau1, niveau2, sexeMembre1, sexeMembre2) {
        if (niveau1 === 0 && niveau2 === 0) {
            return "Même personne";
        }

        // Membre2 est le parent de Membre1
        if (niveau1 === 1 && niveau2 === 0) {
            return sexeMembre2 === 'M' ? "Père" : "Mère";
        }

        // Membre2 est l'enfant de Membre1
        if (niveau1 === 0 && niveau2 === 1) {
            return sexeMembre2 === 'M' ? "Fils" : "Fille";
        }

        // Membre2 est le grand-parent de Membre1
        if (niveau1 === 2 && niveau2 === 0) {
            return sexeMembre2 === 'M' ? "Grand-père" : "Grand-mère";
        }

        // Membre2 est le petit-enfant de Membre1
        if (niveau1 === 0 && niveau2 === 2) {
            return sexeMembre2 === 'M' ? "Petit-fils" : "Petite-fille";
        }

        // Frère ou Sœur (même génération, même parents)
        if (niveau1 === 1 && niveau2 === 1) {
            return sexeMembre2 === 'M' ? "Frère" : "Sœur";
        }

        // Membre2 est l'oncle/tante de Membre1
        if (niveau1 === 2 && niveau2 === 1) {
            return sexeMembre2 === 'M' ? "Oncle" : "Tante";
        }

        // Membre2 est le neveu/nièce de Membre1
        if (niveau1 === 1 && niveau2 === 2) {
            return sexeMembre2 === 'M' ? "Neveu" : "Nièce";
        }

        // Cousins (même niveau, 2+ générations)
        if (niveau1 === 2 && niveau2 === 2) {
            return sexeMembre2 === 'M' ? "Cousin" : "Cousine";
        }

        // Arrière-grand-parent
        if (niveau1 === 3 && niveau2 === 0) {
            return sexeMembre2 === 'M' ? "Arrière-grand-père" : "Arrière-grand-mère";
        }

        // Arrière-petit-enfant
        if (niveau1 === 0 && niveau2 === 3) {
            return sexeMembre2 === 'M' ? "Arrière-petit-fils" : "Arrière-petite-fille";
        }

        return `Lien de parenté au ${niveau1 + niveau2}ème degré`;
    }

    /**
     * Supprimer un membre (avec vérifications)
     */
    static async supprimer(membreId, familleId) {
        try {
            // Vérifier si le membre a des enfants
            const [enfants] = await db.execute(
                'SELECT COUNT(*) as total FROM lien_parental WHERE parent_id = ?',
                [membreId]
            );

            if (enfants[0].total > 0) {
                throw new Error('Impossible de supprimer ce membre car il a des enfants dans l\'arbre');
            }

            // Supprimer les liens parentaux du membre
            await db.execute(
                'DELETE FROM lien_parental WHERE enfant_id = ?',
                [membreId]
            );

            // Supprimer le membre
            const [result] = await db.execute(
                'DELETE FROM membre WHERE id = ? AND famille_id = ?',
                [membreId, familleId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Membre non trouvé');
            }

            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression du membre: ' + error.message);
        }
    }
}

module.exports = Membre;