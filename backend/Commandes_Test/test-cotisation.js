// test-cotisation.js - Script de test pour les cotisations
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let adminToken = '';
let tresorierToken = '';
let ceremonieId = 1;
let tresorierLogin = '';
let tresorierMdpTemp = '';

// Fonction pour afficher les résultats
const log = (titre, data) => {
    console.log('\n' + '='.repeat(50));
    console.log(`📋 ${titre}`);
    console.log('='.repeat(50));
    console.log(JSON.stringify(data, null, 2));
};

// 1. Connexion Admin
async function loginAdmin() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            login: 'admin_famille1',
            motDePasse: 'votreMotDePasse'
        });
        adminToken = response.data.token;
        log('1. Connexion Admin réussie', { token: adminToken.substring(0, 20) + '...' });
    } catch (error) {
        console.error('❌ Erreur connexion admin:', error.response?.data || error.message);
    }
}

// 2. Activer les cotisations
async function activerCotisations() {
    try {
        const response = await axios.post(
            `${BASE_URL}/cotisation/activer`,
            {
                ceremonieId: ceremonieId,
                montantCotisation: 5000,
                nomTresorier: 'Amadou Diallo'
            },
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        
        tresorierLogin = response.data.data.tresorier.login;
        tresorierMdpTemp = response.data.data.tresorier.motDePasseTemporaire;
        
        log('2. Cotisations activées', response.data);
        console.log(`\n🔑 Identifiants trésorier:`);
        console.log(`   Login: ${tresorierLogin}`);
        console.log(`   Mot de passe temporaire: ${tresorierMdpTemp}`);
    } catch (error) {
        console.error('❌ Erreur activation cotisations:', error.response?.data || error.message);
    }
}

// 3. Connexion Trésorier
async function loginTresorier() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            login: tresorierLogin,
            motDePasse: tresorierMdpTemp
        });
        tresorierToken = response.data.token;
        
        log('3. Connexion Trésorier', {
            requirePasswordChange: response.data.user.requirePasswordChange,
            token: tresorierToken.substring(0, 20) + '...'
        });
    } catch (error) {
        console.error('❌ Erreur connexion trésorier:', error.response?.data || error.message);
    }
}

// 4. Changer le mot de passe
async function changerMotDePasse() {
    try {
        const response = await axios.post(
            `${BASE_URL}/cotisation/premier-connexion`,
            {
                ceremonieId: ceremonieId,
                ancienMotDePasse: tresorierMdpTemp,
                nouveauMotDePasse: 'NouveauMotDePasse123!'
            },
            {
                headers: { Authorization: `Bearer ${tresorierToken}` }
            }
        );
        
        log('4. Mot de passe changé', response.data);
    } catch (error) {
        console.error('❌ Erreur changement mot de passe:', error.response?.data || error.message);
    }
}

// 5. Récupérer la liste des cotisations
async function listeCotisations() {
    try {
        const response = await axios.get(
            `${BASE_URL}/cotisation/liste/${ceremonieId}`,
            {
                headers: { Authorization: `Bearer ${tresorierToken}` }
            }
        );
        
        log('5. Liste des cotisations', {
            nombreCotisations: response.data.data.cotisations.length,
            resume: response.data.data.resume
        });
    } catch (error) {
        console.error('❌ Erreur récupération cotisations:', error.response?.data || error.message);
    }
}

// 6. Enregistrer une cotisation
async function enregistrerCotisation(membreId) {
    try {
        const response = await axios.post(
            `${BASE_URL}/cotisation/enregistrer`,
            {
                ceremonieId: ceremonieId,
                membreId: membreId,
                modePaiement: 'orange_money',
                referencePaiement: 'OM' + Date.now(),
                notes: 'Test de cotisation via Orange Money'
            },
            {
                headers: { Authorization: `Bearer ${tresorierToken}` }
            }
        );
        
        log(`6. Cotisation enregistrée pour membre ${membreId}`, response.data);
    } catch (error) {
        console.error('❌ Erreur enregistrement cotisation:', error.response?.data || error.message);
    }
}

// 7. Ajouter une dépense
async function ajouterDepense() {
    try {
        const response = await axios.post(
            `${BASE_URL}/cotisation/depense/ajouter`,
            {
                ceremonieId: ceremonieId,
                libelle: 'Location de tentes',
                montant: 15000,
                description: 'Location de 3 tentes blanches pour la cérémonie'
            },
            {
                headers: { Authorization: `Bearer ${tresorierToken}` }
            }
        );
        
        log('7. Dépense ajoutée', response.data);
    } catch (error) {
        console.error('❌ Erreur ajout dépense:', error.response?.data || error.message);
    }
}

// 8. Tester une dépense qui dépasse le solde
async function testerDepenseExcessive() {
    try {
        const response = await axios.post(
            `${BASE_URL}/cotisation/depense/ajouter`,
            {
                ceremonieId: ceremonieId,
                libelle: 'Dépense excessive',
                montant: 999999999,
                description: 'Cette dépense devrait échouer'
            },
            {
                headers: { Authorization: `Bearer ${tresorierToken}` }
            }
        );
        
        log('8. Dépense excessive (NE DEVRAIT PAS PASSER)', response.data);
    } catch (error) {
        log('8. Dépense excessive rejetée (NORMAL)', error.response?.data);
    }
}

// 9. Récupérer le résumé
async function resumeFinancier() {
    try {
        const response = await axios.get(
            `${BASE_URL}/cotisation/resume/${ceremonieId}`,
            {
                headers: { Authorization: `Bearer ${tresorierToken}` }
            }
        );
        
        log('9. Résumé financier', response.data.data);
    } catch (error) {
        console.error('❌ Erreur résumé:', error.response?.data || error.message);
    }
}

// 10. Liste des dépenses
async function listeDepenses() {
    try {
        const response = await axios.get(
            `${BASE_URL}/cotisation/depenses/${ceremonieId}`,
            {
                headers: { Authorization: `Bearer ${tresorierToken}` }
            }
        );
        
        log('10. Liste des dépenses', {
            nombreDepenses: response.data.data.length,
            depenses: response.data.data
        });
    } catch (error) {
        console.error('❌ Erreur liste dépenses:', error.response?.data || error.message);
    }
}

// Exécuter tous les tests
async function runAllTests() {
    console.log('\n🚀 Démarrage des tests de cotisations...\n');
    
    await loginAdmin();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await activerCotisations();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await loginTresorier();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await changerMotDePasse();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await listeCotisations();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enregistrer quelques cotisations (membres ID 1, 2, 3)
    await enregistrerCotisation(1);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await enregistrerCotisation(2);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await ajouterDepense();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testerDepenseExcessive();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await resumeFinancier();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await listeDepenses();
    
    console.log('\n✅ Tests terminés !\n');
    console.log('📥 Pour tester les exports PDF, utilisez:');
    console.log(`   GET ${BASE_URL}/cotisation/export/cotisations/${ceremonieId}`);
    console.log(`   GET ${BASE_URL}/cotisation/export/depenses/${ceremonieId}`);
}

// Lancer les tests
runAllTests().catch(console.error);