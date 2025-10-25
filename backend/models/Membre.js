// models/Membre.js - Modèle pour la gestion des membres
const db = require('../config/database');

class Membre {
    /**
     * Générer un numéro d'identification unique pour un membre
     * Format: FAM{familleId}-MEM{compteur}
     * Exemple: FAM2-MEM001, FAM2-MEM002, etc.
     */
    static async genererNumeroIdentification(familleId) {
        try {
            // Compter le nombre de membres existants dans la famille
            const [rows] = await db.execute(
                'SELECT COUNT(*) as total FROM membre WHERE famille_id = ?',
                [familleId]
            );
            
            const total = rows[0].total;
            const compteur = total + 1;
            
            // Format: FAM{familleId}-MEM{compteur avec padding}
            const numeroIdentification = `FAM${familleId}-MEM${String(compteur).padStart(3, '0')}`;
            
            // Vérifier l'unicité (au cas où)
            const [existing] = await db.execute(
                'SELECT id FROM membre WHERE numero_identification = ?',
                [numeroIdentification]
            );
            
            if (existing.length > 0) {
                // En cas de collision (rare), utiliser un timestamp
                return `FAM${familleId}-MEM${Date.now()}`;
            }
            
            return numeroIdentification;
        } catch (error) {
            throw new Error('Erreur lors de la génération du numéro d\'identification: ' + error.message);
        }
    }

    static async ajouter(donnesMembre) {
        try {
            const {
                familleId, nom, prenom, sexe, dateNaissance, lieuNaissance,
                profession, lieuResidence, nomConjoint, photo, informationsSupplementaires
            } = donnesMembre;

            // Générer le numéro d'identification unique
            const numeroIdentification = await this.genererNumeroIdentification(familleId);

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
            const [liens] = await db.execute(
                `SELECT lp.*, 
                m1.nom as enfant_nom, m1.prenom as enfant_prenom, m1.numero_identification as enfant_numero,
                m2.nom as parent_nom, m2.prenom as parent_prenom, m2.numero_identification as parent_numero
                FROM lien_parental lp
                JOIN membre m1 ON lp.enfant_id = m1.id
                JOIN membre m2 ON lp.parent_id = m2.id
                WHERE lp.famille_id = ?`,
                [familleId]
            );

            return {
                membres,
                liens
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
            // Algorithme pour trouver le chemin entre deux membres
            // Implémentation d'un parcours en largeur (BFS) pour trouver l'ancêtre commun
            
            const query = `
                WITH RECURSIVE arbre_ascendant1 AS (
                    SELECT id, numero_identification, nom, prenom, 0 as niveau
                    FROM membre WHERE id = ? AND famille_id = ?
                    UNION ALL
                    SELECT m.id, m.numero_identification, m.nom, m.prenom, aa.niveau + 1
                    FROM membre m
                    JOIN lien_parental lp ON m.id = lp.parent_id
                    JOIN arbre_ascendant1 aa ON lp.enfant_id = aa.id
                    WHERE aa.niveau < 10
                ),
                arbre_ascendant2 AS (
                    SELECT id, numero_identification, nom, prenom, 0 as niveau
                    FROM membre WHERE id = ? AND famille_id = ?
                    UNION ALL
                    SELECT m.id, m.numero_identification, m.nom, m.prenom, aa.niveau + 1
                    FROM membre m
                    JOIN lien_parental lp ON m.id = lp.parent_id
                    JOIN arbre_ascendant2 aa ON lp.enfant_id = aa.id
                    WHERE aa.niveau < 10
                )
                SELECT aa1.*, aa2.niveau as niveau2
                FROM arbre_ascendant1 aa1
                JOIN arbre_ascendant2 aa2 ON aa1.id = aa2.id
                ORDER BY aa1.niveau + aa2.niveau
                LIMIT 1
            `;

            const [result] = await db.execute(query, [membreId1, familleId, membreId2, familleId]);
            
            if (result.length > 0) {
                const ancetreCommun = result[0];
                const degre = ancetreCommun.niveau + ancetreCommun.niveau2;
                
                return {
                    ancetreCommun: {
                        id: ancetreCommun.id,
                        numero: ancetreCommun.numero_identification,
                        nom: ancetreCommun.nom,
                        prenom: ancetreCommun.prenom
                    },
                    degre: degre,
                    description: this.decrireLienParente(ancetreCommun.niveau, ancetreCommun.niveau2)
                };
            }
            
            return null;
        } catch (error) {
            throw new Error('Erreur lors de la recherche de lien de parenté: ' + error.message);
        }
    }

    /**
     * Décrire le lien de parenté en langage naturel
     */
    static decrireLienParente(niveau1, niveau2) {
        if (niveau1 === 0 && niveau2 === 0) {
            return "Même personne";
        }
        
        if (niveau1 === 1 && niveau2 === 0) {
            return "Parent";
        }
        
        if (niveau1 === 0 && niveau2 === 1) {
            return "Enfant";
        }
        
        if (niveau1 === 2 && niveau2 === 0) {
            return "Grand-parent";
        }
        
        if (niveau1 === 0 && niveau2 === 2) {
            return "Petit-enfant";
        }
        
        if (niveau1 === 1 && niveau2 === 1) {
            return "Frère/Sœur";
        }
        
        if (niveau1 === 2 && niveau2 === 1) {
            return "Oncle/Tante";
        }
        
        if (niveau1 === 1 && niveau2 === 2) {
            return "Neveu/Nièce";
        }
        
        if (niveau1 === 2 && niveau2 === 2) {
            return "Cousin(e)";
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