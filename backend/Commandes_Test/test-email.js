require('dotenv').config();
const nodemailer = require('nodemailer');

async function testerEmail() {
    console.log('🧪 TEST EMAIL SENASKANE\n');
    console.log('Configuration:');
    console.log('- SMTP_HOST:', process.env.SMTP_HOST);
    console.log('- SMTP_PORT:', process.env.SMTP_PORT);
    console.log('- SMTP_USER:', process.env.SMTP_USER);
    console.log('- SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NON DÉFINI');
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true,
        logger: true
    });
    
    try {
        console.log('\n🔄 Vérification connexion SMTP...');
        await transporter.verify();
        console.log('✅ Connexion réussie!\n');
        
        console.log('📤 Envoi email de test à:', process.env.SMTP_USER);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.SMTP_USER,
            subject: '🧪 Test Senaskane',
            text: 'Si vous recevez cet email, la configuration fonctionne!',
            html: '<h2>✅ Ça marche!</h2><p>L\'email fonctionne correctement.</p>'
        });
        
        console.log('\n✅ EMAIL ENVOYÉ!');
        console.log('Message ID:', info.messageId);
        console.log('📬 Vérifiez votre boîte:', process.env.SMTP_USER);
        console.log('(Regardez aussi dans les spams/courrier indésirable)');
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('Code:', error.code);
        
        if (error.responseCode === 535) {
            console.log('\n💡 SOLUTION - Identifiants invalides:');
            console.log('1. Allez sur: https://myaccount.google.com/apppasswords');
            console.log('2. Créez un NOUVEAU mot de passe d\'application');
            console.log('3. Copiez-le (format: xxxx xxxx xxxx xxxx)');
            console.log('4. Mettez-le dans .env: SMTP_PASS=votre_mot_de_passe');
            console.log('5. Relancez ce test');
        }
    }
}

testerEmail();