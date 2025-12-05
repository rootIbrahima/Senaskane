/**
 * Script de migration pour renuméroter tous les membres avec la numérotation hiérarchique
 *
 * Fonctionnement :
 * 1. Pour chaque famille :
 *    - Trouver les membres racines (sans parents)
 *    - Les numéroter 001, 002, 003, ...
 *    - Pour chaque racine, parcourir récursivement leurs descendants
 *    - Numéroter les enfants : {numeroParent}.001, {numeroParent}.002, etc.
 *
 * ATTENTION : Ce script modifie tous les numéros d'identification
 * Sauvegarder la base de données avant de l'exécuter !
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
};

/**
 * Récupérer toutes les familles
 */
async function getFamilles(connection) {
    const [familles] = await connection.execute('SELECT id, nom FROM famille');
    return familles;
}

/**
 * Récupérer les membres racines d'une famille (sans parents)
 */
async function getRacines(connection, familleId) {
    const [racines] = await connection.execute(`
        SELECT DISTINCT m.*
        FROM membre m
        LEFT JOIN lien_parental lp ON m.id = lp.enfant_id
        WHERE m.famille_id = ? AND lp.id IS NULL
        ORDER BY m.id ASC
    `, [familleId]);
    return racines;
}

/**
 * Récupérer les enfants d'un membre (basé sur les liens père/mère)
 */
async function getEnfants(connection, parentId) {
    const [enfants] = await connection.execute(`
        SELECT DISTINCT m.*, lp.type_lien
        FROM membre m
        JOIN lien_parental lp ON m.id = lp.enfant_id
        WHERE lp.parent_id = ?
        ORDER BY lp.type_lien DESC, m.id ASC
    `, [parentId]);
    return enfants;
}

/**
 * Mettre à jour le numéro d'identification d'un membre
 */
async function updateNumero(connection, membreId, nouveauNumero) {
    await connection.execute(
        'UPDATE membre SET numero_identification = ? WHERE id = ?',
        [nouveauNumero, membreId]
    );
}

/**
 * Renuméroter récursivement un membre et ses descendants
 */
async function renumeroterDescendants(connection, membreId, numeroParent, compteur = {}) {
    const enfants = await getEnfants(connection, membreId);

    // Initialiser le compteur pour ce parent
    if (!compteur[membreId]) {
        compteur[membreId] = 1;
    }

    for (const enfant of enfants) {
        // Générer le nouveau numéro : {numeroParent}.{compteur}
        const nouveauNumero = `${numeroParent}.${String(compteur[membreId]).padStart(3, '0')}`;

        console.log(`  → Membre ${enfant.id} (${enfant.prenom} ${enfant.nom}): ${enfant.numero_identification} → ${nouveauNumero}`);

        // Mettre à jour le numéro
        await updateNumero(connection, enfant.id, nouveauNumero);

        // Incrémenter le compteur pour ce parent
        compteur[membreId]++;

        // Renuméroter récursivement les descendants
        await renumeroterDescendants(connection, enfant.id, nouveauNumero, compteur);
    }
}

/**
 * Renuméroter tous les membres d'une famille
 */
async function renumeroterFamille(connection, famille) {
    console.log(`\n========================================`);
    console.log(`Traitement de la famille: ${famille.nom} (ID: ${famille.id})`);
    console.log(`========================================\n`);

    // 1. Récupérer les racines
    const racines = await getRacines(connection, famille.id);
    console.log(`Nombre de racines trouvées: ${racines.length}\n`);

    if (racines.length === 0) {
        console.log(`Aucune racine trouvée pour cette famille.\n`);
        return;
    }

    // Préfixe de famille
    const famillePrefix = `FAM${famille.id}-`;

    // 2. Renuméroter les racines
    let compteurRacine = 1;
    for (const racine of racines) {
        const nouveauNumero = `${famillePrefix}${String(compteurRacine).padStart(3, '0')}`;

        console.log(`Racine ${compteurRacine}: ${racine.prenom} ${racine.nom}`);
        console.log(`  ${racine.numero_identification} → ${nouveauNumero}`);

        // Mettre à jour le numéro de la racine
        await updateNumero(connection, racine.id, nouveauNumero);

        // Renuméroter récursivement les descendants
        await renumeroterDescendants(connection, racine.id, nouveauNumero);

        compteurRacine++;
        console.log('');
    }

    console.log(`✓ Famille "${famille.nom}" renumérotée avec succès\n`);
}

/**
 * Fonction principale de migration
 */
async function main() {
    console.log('\n================================================');
    console.log('SCRIPT DE RENUMÉROTATION HIÉRARCHIQUE');
    console.log('================================================\n');
    console.log('ATTENTION : Ce script va modifier tous les numéros d\'identification !');
    console.log('Assurez-vous d\'avoir une sauvegarde de la base de données.\n');

    let connection;

    try {
        // Connexion à la base de données
        console.log('Connexion à la base de données...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connexion établie\n');

        // Démarrer une transaction
        await connection.beginTransaction();
        console.log('✓ Transaction démarrée\n');

        // ÉTAPE 1: Renommer temporairement tous les membres pour éviter les conflits
        console.log('ÉTAPE 1: Renommage temporaire de tous les membres...\n');
        const [allMembres] = await connection.execute('SELECT id, numero_identification FROM membre');
        console.log(`Nombre total de membres à renommer: ${allMembres.length}`);

        for (const membre of allMembres) {
            const tempNumero = `TMP${membre.id}`;
            await updateNumero(connection, membre.id, tempNumero);
            console.log(`  Membre ${membre.id}: ${membre.numero_identification} → ${tempNumero}`);
        }
        console.log('✓ Tous les membres ont été renommés temporairement\n');

        // ÉTAPE 2: Récupérer toutes les familles et renuméroter
        console.log('ÉTAPE 2: Renumérotation hiérarchique...\n');
        const familles = await getFamilles(connection);
        console.log(`Nombre de familles trouvées: ${familles.length}\n`);

        // Renuméroter chaque famille
        for (const famille of familles) {
            await renumeroterFamille(connection, famille);
        }

        // Valider la transaction
        await connection.commit();
        console.log('\n================================================');
        console.log('✓ MIGRATION TERMINÉE AVEC SUCCÈS');
        console.log('================================================\n');

    } catch (error) {
        console.error('\n================================================');
        console.error('✗ ERREUR LORS DE LA MIGRATION');
        console.error('================================================\n');
        console.error('Erreur:', error.message);
        console.error('Stack:', error.stack);

        // Annuler la transaction en cas d'erreur
        if (connection) {
            try {
                await connection.rollback();
                console.log('\n✓ Transaction annulée (rollback)');
            } catch (rollbackError) {
                console.error('✗ Erreur lors du rollback:', rollbackError.message);
            }
        }

        process.exit(1);

    } finally {
        // Fermer la connexion
        if (connection) {
            await connection.end();
            console.log('✓ Connexion fermée\n');
        }
    }
}

// Exécuter la migration
main();
