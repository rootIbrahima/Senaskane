// server.js - Point d'entrée complet de l'application Senaskane
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Charger .env uniquement en développement
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Import des routes
const authRoutes = require('./routes/auth');
const familleRoutes = require('./routes/famille');
const membreRoutes = require('./routes/membre');
const ceremonieRoutes = require('./routes/ceremonie');
const museeRoutes = require('./routes/musee');
const rechercheRoutes = require('./routes/recherche');
const cotisationRoutes = require('./routes/cotisation');
const adminRoutes = require('./routes/admin');


const app = express();

// Trust proxy - Important pour Render/Heroku
app.set('trust proxy', 1);

// ===========================
// MIDDLEWARE DE SÉCURITÉ
// ===========================

// Helmet pour sécuriser les headers HTTP
// Configuration Helmet pour permettre le chargement des images
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Désactivé pour permettre le chargement des images
}));

// CORS - Autoriser les requêtes cross-origin
const allowedOrigins = [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
    'https://senaskane.onrender.com',
    'exp://localhost:8081',
];

// Ajouter les origines depuis la variable d'environnement si elle existe
if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

const corsOptions = {
    origin: function (origin, callback) {
        // Permettre les requêtes sans origine (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parser le JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Limitation du taux de requêtes (Rate Limiting)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite à 100 requêtes par fenêtre par IP
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Appliquer le rate limiting à toutes les routes
app.use('/api/', limiter);

// Rate limiting plus strict pour l'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Augmenté pour le développement (était 5)
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
});

// Désactiver le rate limiter en développement
if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Rate limiting désactivé en mode développement');
} else {
    app.use('/api/auth/login', authLimiter);
}

// ===========================
// ROUTES STATIQUES
// ===========================

// Servir les fichiers uploadés
app.use('/uploads/photos', express.static(path.join(__dirname, 'uploads/photos')));
app.use('/uploads/logos', express.static(path.join(__dirname, 'uploads/logos')));
app.use('/uploads/musee', express.static(path.join(__dirname, 'uploads/musee')));

// ===========================
// ROUTES API
// ===========================

// Route de santé (health check)
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API Senaskane',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            famille: '/api/famille',
            membre: '/api/membre',
            ceremonie: '/api/ceremonie',
            musee: '/api/musee',
            recherche: '/api/recherche',
            cotisation: '/api/cotisation'
        }
    });
});

// Monter les routes
app.use('/api/auth', authRoutes);
app.use('/api/famille', familleRoutes);
app.use('/api/membre', membreRoutes);
app.use('/api/ceremonie', ceremonieRoutes);
app.use('/api/musee', museeRoutes);
app.use('/api/recherche', rechercheRoutes);
app.use('/api/cotisation', cotisationRoutes);
app.use('/api/admin', adminRoutes);


// ===========================
// GESTION DES ERREURS
// ===========================

// Route 404 - Non trouvée
app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.path,
        method: req.method
    });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    // Log l'erreur
    console.error('Erreur:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    // Erreurs de validation Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'Le fichier est trop volumineux',
            maxSize: '10MB'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            error: 'Trop de fichiers'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Champ de fichier inattendu'
        });
    }

    // Erreurs de base de données MySQL
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Cette entrée existe déjà',
            field: err.sqlMessage
        });
    }

    if (err.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(400).json({
            error: 'Champ de base de données invalide'
        });
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'Référence invalide - l\'élément référencé n\'existe pas'
        });
    }

    // Erreurs JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token invalide'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expiré'
        });
    }

    // Erreurs de validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Erreur de validation',
            details: err.details || err.message
        });
    }

    // Erreur générique
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Une erreur interne s\'est produite' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// ===========================
// DÉMARRAGE DU SERVEUR
// ===========================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log('='.repeat(50));
    console.log('🌳 SENASKANE API DÉMARRÉE');
    console.log('='.repeat(50));
    console.log(`📍 URL: http://${HOST}:${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
    console.log('='.repeat(50));
    console.log('📚 Endpoints disponibles:');
    console.log(`   - Health Check: http://localhost:${PORT}/health`);
    console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
    console.log(`   - Famille: http://localhost:${PORT}/api/famille`);
    console.log(`   - Membre: http://localhost:${PORT}/api/membre`);
    console.log(`   - Cérémonie: http://localhost:${PORT}/api/ceremonie`);
    console.log(`   - Musée: http://localhost:${PORT}/api/musee`);
    console.log(`   - Recherche: http://localhost:${PORT}/api/recherche`);
    console.log(`   - Cotisation: http://localhost:${PORT}/api/cotisation`);
    console.log('='.repeat(50));
});

// ===========================
// GESTION DES SIGNAUX DE FIN
// ===========================

// Fonction pour fermer proprement le serveur
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} reçu. Fermeture propre du serveur...`);
    
    server.close(() => {
        console.log('✅ Serveur HTTP fermé');
        
        // Fermer la connexion à la base de données
        const db = require('./config/database');
        db.end((err) => {
            if (err) {
                console.error('❌ Erreur lors de la fermeture de la DB:', err);
                process.exit(1);
            }
            console.log('✅ Connexion DB fermée');
            process.exit(0);
        });
    });

    // Forcer la fermeture après 10 secondes
    setTimeout(() => {
        console.error('❌ Fermeture forcée après timeout');
        process.exit(1);
    }, 10000);
};

// Écouter les signaux de fermeture
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
    console.error('❌ Exception non capturée:', err);
    console.error('Le serveur continue de fonctionner...');
    // gracefulShutdown('uncaughtException'); // Commenté pour debug
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
    console.error('Le serveur continue de fonctionner...');
    // gracefulShutdown('unhandledRejection'); // Commenté pour debug
});

// Export pour les tests
module.exports = app;