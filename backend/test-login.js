// Test de connexion pour débugger
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function testLogin() {
    const login = 'diop_test'; // Changez selon votre login
    const motDePasse = 'password123'; // Mettez le mot de passe que vous avez utilisé

    console.log('🔍 Test de connexion pour:', login);
    console.log('🔑 Mot de passe testé:', motDePasse);
    console.log('');

    try {
        // Récupérer l'utilisateur
        const [users] = await db.execute(
            'SELECT u.*, f.nom as famille_nom FROM utilisateur u JOIN famille f ON u.famille_id = f.id WHERE u.login = ?',
            [login]
        );

        if (users.length === 0) {
            console.log('❌ Utilisateur non trouvé');
            process.exit(1);
        }

        const user = users[0];
        console.log('✅ Utilisateur trouvé:');
        console.log('   - ID:', user.id);
        console.log('   - Login:', user.login);
        console.log('   - Nom:', user.nom, user.prenom);
        console.log('   - Famille:', user.famille_nom);
        console.log('   - Hash:', user.mot_de_passe_hash);
        console.log('   - Actif:', user.est_active ? 'Oui' : 'Non');
        console.log('');

        // Tester le mot de passe
        console.log('🔐 Comparaison du mot de passe...');
        const isValid = await bcrypt.compare(motDePasse, user.mot_de_passe_hash);

        if (isValid) {
            console.log('✅ MOT DE PASSE CORRECT !');
            console.log('La connexion devrait fonctionner.');
        } else {
            console.log('❌ MOT DE PASSE INCORRECT !');
            console.log('Le hash ne correspond pas au mot de passe fourni.');
            console.log('');
            console.log('💡 Essayez avec un autre mot de passe ou créez un nouveau compte.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

testLogin();
