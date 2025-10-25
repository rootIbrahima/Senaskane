// routes/recherche.js - Routes de recherche avancées
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/recherche/lien-parente/:membreId1/:membreId2
 * Rechercher le lien de parenté entre deux personnes
 * Retourne l'ancêtre commun et le chemin entre les deux personnes
 */
router.get('/lien-parente/:membreId1/:membreId2', authenticateToken, async (req, res) => {
    try {
        const membreId1 = parseInt(req.params.membreId1);
        const membreId2 = parseInt(req.params.membreId2);
        const familleId = req.user.familleId;

        if (membreId1 === membreId2) {
            return res.status(400).json({ error: 'Les deux membres doivent être différents' });
        }

        // Vérifier que les deux membres existent et appartiennent à la famille
        const [membres] = await db.execute(
            'SELECT id, nom, prenom FROM membre WHERE id IN (?, ?) AND famille_id = ?',
            [membreId1, membreId2, familleId]
        );

        if (membres.length !== 2) {
            return res.status(404).json({ error: 'Un ou plusieurs membres non trouvés' });
        }

        // Algorithme pour trouver l'ancêtre commun
        // On utilise une requête récursive pour remonter l'arbre généalogique
        const query = `
            WITH RECURSIVE 
            -- Arbre ascendant du membre 1
            arbre_ascendant1 AS (
                SELECT 
                    m.id, 
                    m.numero_identification,
                    m.nom, 
                    m.prenom,
                    0 as niveau,
                    CAST(m.id AS CHAR(1000)) as chemin
                FROM membre m 
                WHERE m.id = ? AND m.famille_id = ?
                
                UNION ALL
                
                SELECT 
                    m.id,
                    m.numero_identification,
                    m.nom,
                    m.prenom,
                    aa.niveau + 1,
                    CONCAT(aa.chemin, '->', m.id)
                FROM membre m
                JOIN lien_parental lp ON m.id = lp.parent_id
                JOIN arbre_ascendant1 aa ON lp.enfant_id = aa.id
                WHERE aa.niveau < 15
            ),
            -- Arbre ascendant du membre 2
            arbre_ascendant2 AS (
                SELECT 
                    m.id,
                    m.numero_identification,
                    m.nom,
                    m.prenom,
                    0 as niveau,
                    CAST(m.id AS CHAR(1000)) as chemin
                FROM membre m 
                WHERE m.id = ? AND m.famille_id = ?
                
                UNION ALL
                
                SELECT 
                    m.id,
                    m.numero_identification,
                    m.nom,
                    m.prenom,
                    aa.niveau + 1,
                    CONCAT(aa.chemin, '->', m.id)
                FROM membre m
                JOIN lien_parental lp ON m.id = lp.parent_id
                JOIN arbre_ascendant2 aa ON lp.enfant_id = aa.id
                WHERE aa.niveau < 15
            )
            -- Trouver l'ancêtre commun le plus proche
            SELECT 
                aa1.id as ancetre_commun_id,
                aa1.nom as ancetre_nom,
                aa1.prenom as ancetre_prenom,
                aa1.numero_identification as ancetre_numero,
                aa1.niveau as distance_membre1,
                aa2.niveau as distance_membre2,
                aa1.chemin as chemin_membre1,
                aa2.chemin as chemin_membre2,
                (aa1.niveau + aa2.niveau) as distance_totale
            FROM arbre_ascendant1 aa1
            JOIN arbre_ascendant2 aa2 ON aa1.id = aa2.id
            ORDER BY distance_totale ASC, aa1.niveau ASC
            LIMIT 1
        `;

        const [result] = await db.execute(query, [membreId1, familleId, membreId2, familleId]);

        if (result.length === 0) {
            return res.json({
                data: {
                    lienTrouve: false,
                    message: 'Aucun ancêtre commun trouvé entre ces deux personnes',
                    membre1: membres.find(m => m.id === membreId1),
                    membre2: membres.find(m => m.id === membreId2)
                }
            });
        }

        const lien = result[0];

        // Récupérer les détails du chemin pour chaque membre
        const chemin1Ids = lien.chemin_membre1.split('->').map(id => parseInt(id));
        const chemin2Ids = lien.chemin_membre2.split('->').map(id => parseInt(id));

        const [detailsChemin1] = await db.execute(
            `SELECT id, nom, prenom, numero_identification 
             FROM membre 
             WHERE id IN (${chemin1Ids.join(',')}) 
             ORDER BY FIELD(id, ${chemin1Ids.join(',')})`
        );

        const [detailsChemin2] = await db.execute(
            `SELECT id, nom, prenom, numero_identification 
             FROM membre 
             WHERE id IN (${chemin2Ids.join(',')}) 
             ORDER BY FIELD(id, ${chemin2Ids.join(',')})`
        );

        // Déterminer le type de lien de parenté
        let typeLien = '';
        const distance1 = lien.distance_membre1;
        const distance2 = lien.distance_membre2;

        if (distance1 === 0 && distance2 === 1) {
            typeLien = 'Parent direct';
        } else if (distance1 === 1 && distance2 === 0) {
            typeLien = 'Enfant direct';
        } else if (distance1 === 0 && distance2 === 2) {
            typeLien = 'Grand-parent';
        } else if (distance1 === 2 && distance2 === 0) {
            typeLien = 'Petit-enfant';
        } else if (distance1 === 1 && distance2 === 1) {
            typeLien = 'Frères/Sœurs';
        } else if (distance1 === 2 && distance2 === 2) {
            typeLien = 'Cousins germains';
        } else if (distance1 === 2 && distance2 === 1) {
            typeLien = 'Oncle/Tante et Neveu/Nièce';
        } else if (distance1 === 1 && distance2 === 2) {
            typeLien = 'Neveu/Nièce et Oncle/Tante';
        } else {
            typeLien = `${distance1 + distance2}ème degré de parenté`;
        }

        res.json({
            data: {
                lienTrouve: true,
                ancetreCommun: {
                    id: lien.ancetre_commun_id,
                    nom: lien.ancetre_nom,
                    prenom: lien.ancetre_prenom,
                    numeroIdentification: lien.ancetre_numero
                },
                typeLien: typeLien,
                distanceTotale: lien.distance_totale,
                cheminMembre1: {
                    distance: distance1,
                    generations: distance1 === 0 ? 'Même personne' : `${distance1} génération(s)`,
                    parcours: detailsChemin1
                },
                cheminMembre2: {
                    distance: distance2,
                    generations: distance2 === 0 ? 'Même personne' : `${distance2} génération(s)`,
                    parcours: detailsChemin2
                },
                membre1: membres.find(m => m.id === membreId1),
                membre2: membres.find(m => m.id === membreId2)
            }
        });

    } catch (error) {
        console.error('Erreur recherche lien parenté:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/recherche/lieu
 * Rechercher des membres par lieu (naissance ou résidence)
 */
router.get('/lieu', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const { lieu, type } = req.query;

        if (!lieu) {
            return res.status(400).json({ error: 'Le paramètre lieu est requis' });
        }

        let query = `
            SELECT 
                m.*,
                CASE 
                    WHEN m.lieu_naissance LIKE ? THEN 'naissance'
                    WHEN m.lieu_residence LIKE ? THEN 'residence'
                    ELSE 'autre'
                END as type_correspondance
            FROM membre m
            WHERE m.famille_id = ?
        `;

        const params = [`%${lieu}%`, `%${lieu}%`, familleId];

        // Filtrer par type si spécifié
        if (type === 'naissance') {
            query += ' AND m.lieu_naissance LIKE ?';
            params.push(`%${lieu}%`);
        } else if (type === 'residence') {
            query += ' AND m.lieu_residence LIKE ?';
            params.push(`%${lieu}%`);
        } else {
            query += ' AND (m.lieu_naissance LIKE ? OR m.lieu_residence LIKE ?)';
            params.push(`%${lieu}%`, `%${lieu}%`);
        }

        query += ' ORDER BY m.nom, m.prenom';

        const [membres] = await db.execute(query, params);

        res.json({
            data: {
                total: membres.length,
                lieu: lieu,
                membres: membres
            }
        });

    } catch (error) {
        console.error('Erreur recherche par lieu:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/recherche/metier
 * Rechercher des membres par métier/profession
 */
router.get('/metier', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const { metier } = req.query;

        if (!metier) {
            return res.status(400).json({ error: 'Le paramètre metier est requis' });
        }

        const [membres] = await db.execute(
            `SELECT * FROM membre 
             WHERE famille_id = ? AND profession LIKE ?
             ORDER BY nom, prenom`,
            [familleId, `%${metier}%`]
        );

        res.json({
            data: {
                total: membres.length,
                metier: metier,
                membres: membres
            }
        });

    } catch (error) {
        console.error('Erreur recherche par métier:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/recherche/nom
 * Rechercher des membres par nom ou prénom
 */
router.get('/nom', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const { recherche } = req.query;

        if (!recherche) {
            return res.status(400).json({ error: 'Le paramètre recherche est requis' });
        }

        const [membres] = await db.execute(
            `SELECT * FROM membre 
             WHERE famille_id = ? 
             AND (nom LIKE ? OR prenom LIKE ? OR CONCAT(prenom, ' ', nom) LIKE ?)
             ORDER BY nom, prenom`,
            [familleId, `%${recherche}%`, `%${recherche}%`, `%${recherche}%`]
        );

        res.json({
            data: {
                total: membres.length,
                recherche: recherche,
                membres: membres
            }
        });

    } catch (error) {
        console.error('Erreur recherche par nom:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/recherche/numero
 * Rechercher un membre par numéro d'identification
 */
router.get('/numero/:numero', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const numero = req.params.numero;

        const [membres] = await db.execute(
            `SELECT m.*,
             p.id as pere_id, p.nom as pere_nom, p.prenom as pere_prenom,
             me.id as mere_id, me.nom as mere_nom, me.prenom as mere_prenom
             FROM membre m
             LEFT JOIN lien_parental lp_pere ON m.id = lp_pere.enfant_id AND lp_pere.type_lien = 'pere'
             LEFT JOIN membre p ON lp_pere.parent_id = p.id
             LEFT JOIN lien_parental lp_mere ON m.id = lp_mere.enfant_id AND lp_mere.type_lien = 'mere'
             LEFT JOIN membre me ON lp_mere.parent_id = me.id
             WHERE m.numero_identification = ? AND m.famille_id = ?`,
            [numero, familleId]
        );

        if (membres.length === 0) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }

        // Récupérer les enfants
        const [enfants] = await db.execute(
            `SELECT m.* FROM membre m
             JOIN lien_parental lp ON m.id = lp.enfant_id
             WHERE lp.parent_id = ? AND m.famille_id = ?`,
            [membres[0].id, familleId]
        );

        res.json({
            data: {
                ...membres[0],
                enfants: enfants
            }
        });

    } catch (error) {
        console.error('Erreur recherche par numéro:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/recherche/avancee
 * Recherche avancée avec plusieurs critères
 */
router.get('/avancee', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;
        const { 
            nom, 
            prenom, 
            sexe, 
            profession, 
            lieuNaissance, 
            lieuResidence,
            anneeNaissanceMin,
            anneeNaissanceMax
        } = req.query;

        let query = 'SELECT * FROM membre WHERE famille_id = ?';
        const params = [familleId];

        if (nom) {
            query += ' AND nom LIKE ?';
            params.push(`%${nom}%`);
        }

        if (prenom) {
            query += ' AND prenom LIKE ?';
            params.push(`%${prenom}%`);
        }

        if (sexe) {
            query += ' AND sexe = ?';
            params.push(sexe);
        }

        if (profession) {
            query += ' AND profession LIKE ?';
            params.push(`%${profession}%`);
        }

        if (lieuNaissance) {
            query += ' AND lieu_naissance LIKE ?';
            params.push(`%${lieuNaissance}%`);
        }

        if (lieuResidence) {
            query += ' AND lieu_residence LIKE ?';
            params.push(`%${lieuResidence}%`);
        }

        if (anneeNaissanceMin) {
            query += ' AND YEAR(date_naissance) >= ?';
            params.push(anneeNaissanceMin);
        }

        if (anneeNaissanceMax) {
            query += ' AND YEAR(date_naissance) <= ?';
            params.push(anneeNaissanceMax);
        }

        query += ' ORDER BY nom, prenom';

        const [membres] = await db.execute(query, params);

        res.json({
            data: {
                total: membres.length,
                criteres: req.query,
                membres: membres
            }
        });

    } catch (error) {
        console.error('Erreur recherche avancée:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/recherche/descendants/:membreId
 * Obtenir tous les descendants d'un membre
 */
router.get('/descendants/:membreId', authenticateToken, async (req, res) => {
    try {
        const membreId = parseInt(req.params.membreId);
        const familleId = req.user.familleId;

        // Vérifier que le membre existe
        const [membre] = await db.execute(
            'SELECT * FROM membre WHERE id = ? AND famille_id = ?',
            [membreId, familleId]
        );

        if (membre.length === 0) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }

        // Requête récursive pour obtenir tous les descendants
        const query = `
            WITH RECURSIVE descendants AS (
                SELECT 
                    m.id,
                    m.numero_identification,
                    m.nom,
                    m.prenom,
                    m.sexe,
                    m.date_naissance,
                    0 as generation,
                    CAST(m.id AS CHAR(1000)) as chemin
                FROM membre m
                WHERE m.id = ? AND m.famille_id = ?
                
                UNION ALL
                
                SELECT 
                    m.id,
                    m.numero_identification,
                    m.nom,
                    m.prenom,
                    m.sexe,
                    m.date_naissance,
                    d.generation + 1,
                    CONCAT(d.chemin, '->', m.id)
                FROM membre m
                JOIN lien_parental lp ON m.id = lp.enfant_id
                JOIN descendants d ON lp.parent_id = d.id
                WHERE d.generation < 10
            )
            SELECT * FROM descendants
            ORDER BY generation, nom, prenom
        `;

        const [descendants] = await db.execute(query, [membreId, familleId]);

        // Compter par génération
        const parGeneration = {};
        descendants.forEach(d => {
            if (!parGeneration[d.generation]) {
                parGeneration[d.generation] = 0;
            }
            parGeneration[d.generation]++;
        });

        res.json({
            data: {
                membre: membre[0],
                totalDescendants: descendants.length - 1, // Exclure le membre lui-même
                parGeneration: parGeneration,
                descendants: descendants
            }
        });

    } catch (error) {
        console.error('Erreur recherche descendants:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/recherche/ascendants/:membreId
 * Obtenir tous les ascendants (ancêtres) d'un membre
 */
router.get('/ascendants/:membreId', authenticateToken, async (req, res) => {
    try {
        const membreId = parseInt(req.params.membreId);
        const familleId = req.user.familleId;

        // Vérifier que le membre existe
        const [membre] = await db.execute(
            'SELECT * FROM membre WHERE id = ? AND famille_id = ?',
            [membreId, familleId]
        );

        if (membre.length === 0) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }

        // Requête récursive pour obtenir tous les ascendants
        const query = `
            WITH RECURSIVE ascendants AS (
                SELECT 
                    m.id,
                    m.numero_identification,
                    m.nom,
                    m.prenom,
                    m.sexe,
                    m.date_naissance,
                    0 as generation,
                    CAST(m.id AS CHAR(1000)) as chemin,
                    NULL as type_lien
                FROM membre m
                WHERE m.id = ? AND m.famille_id = ?
                
                UNION ALL
                
                SELECT 
                    m.id,
                    m.numero_identification,
                    m.nom,
                    m.prenom,
                    m.sexe,
                    m.date_naissance,
                    a.generation + 1,
                    CONCAT(a.chemin, '->', m.id),
                    lp.type_lien
                FROM membre m
                JOIN lien_parental lp ON m.id = lp.parent_id
                JOIN ascendants a ON lp.enfant_id = a.id
                WHERE a.generation < 10
            )
            SELECT * FROM ascendants
            ORDER BY generation DESC, nom, prenom
        `;

        const [ascendants] = await db.execute(query, [membreId, familleId]);

        // Compter par génération
        const parGeneration = {};
        ascendants.forEach(a => {
            if (!parGeneration[a.generation]) {
                parGeneration[a.generation] = 0;
            }
            parGeneration[a.generation]++;
        });

        res.json({
            data: {
                membre: membre[0],
                totalAscendants: ascendants.length - 1, // Exclure le membre lui-même
                parGeneration: parGeneration,
                ascendants: ascendants
            }
        });

    } catch (error) {
        console.error('Erreur recherche ascendants:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/recherche/statistiques
 * Obtenir des statistiques de recherche
 */
router.get('/statistiques', authenticateToken, async (req, res) => {
    try {
        const familleId = req.user.familleId;

        // Membres par lieu de naissance
        const [parLieuNaissance] = await db.execute(
            `SELECT lieu_naissance, COUNT(*) as total 
             FROM membre 
             WHERE famille_id = ? AND lieu_naissance IS NOT NULL
             GROUP BY lieu_naissance 
             ORDER BY total DESC 
             LIMIT 10`,
            [familleId]
        );

        // Membres par lieu de résidence
        const [parLieuResidence] = await db.execute(
            `SELECT lieu_residence, COUNT(*) as total 
             FROM membre 
             WHERE famille_id = ? AND lieu_residence IS NOT NULL
             GROUP BY lieu_residence 
             ORDER BY total DESC 
             LIMIT 10`,
            [familleId]
        );

        // Membres par profession
        const [parProfession] = await db.execute(
            `SELECT profession, COUNT(*) as total 
             FROM membre 
             WHERE famille_id = ? AND profession IS NOT NULL
             GROUP BY profession 
             ORDER BY total DESC 
             LIMIT 10`,
            [familleId]
        );

        res.json({
            data: {
                topLieuxNaissance: parLieuNaissance,
                topLieuxResidence: parLieuResidence,
                topProfessions: parProfession
            }
        });

    } catch (error) {
        console.error('Erreur statistiques recherche:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;