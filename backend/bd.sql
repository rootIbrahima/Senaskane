-- Base de données pour l'application Senaskane
-- Gestion des arbres généalogiques familiaux

CREATE DATABASE senaskane_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE senaskane_db;

-- Table des familles
CREATE TABLE famille (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    slogan TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    date_expiration DATE,
    lien_whatsapp VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des utilisateurs (administrateurs et membres)
CREATE TABLE utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    famille_id INT NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'membre') NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(150),
    telephone VARCHAR(20),
    code_activation VARCHAR(10),
    est_active BOOLEAN DEFAULT FALSE,
    date_derniere_connexion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES famille(id) ON DELETE CASCADE
);

-- Table des membres de la famille (personnes dans l'arbre)
CREATE TABLE membre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    famille_id INT NOT NULL,
    numero_identification VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    sexe ENUM('M', 'F') NOT NULL,
    date_naissance DATE,
    lieu_naissance VARCHAR(150),
    profession VARCHAR(100),
    lieu_residence VARCHAR(150),
    nom_conjoint VARCHAR(200),
    date_deces DATE NULL,
    lieu_deces VARCHAR(150) NULL,
    photo VARCHAR(255),
    informations_supplementaires TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES famille(id) ON DELETE CASCADE
);

-- Table des liens parentaux
CREATE TABLE lien_parental (
    id INT AUTO_INCREMENT PRIMARY KEY,
    famille_id INT NOT NULL,
    enfant_id INT NOT NULL,
    parent_id INT NOT NULL,
    type_lien ENUM('pere', 'mere') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES famille(id) ON DELETE CASCADE,
    FOREIGN KEY (enfant_id) REFERENCES membre(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES membre(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_enfant (enfant_id, type_lien)
);

-- Table des cérémonies familiales
CREATE TABLE ceremonie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    famille_id INT NOT NULL,
    type_ceremonie ENUM('mariage', 'bapteme', 'deces', 'tour_famille', 'autre') NOT NULL,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    date_ceremonie DATE NOT NULL,
    lieu VARCHAR(150),
    membre_principal_id INT, -- La personne concernée (marié(e), baptisé(e), décédé(e))
    homonyme_id INT NULL, -- Pour les baptêmes, référence à l'homonyme dans l'arbre
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES famille(id) ON DELETE CASCADE,
    FOREIGN KEY (membre_principal_id) REFERENCES membre(id) ON DELETE SET NULL,
    FOREIGN KEY (homonyme_id) REFERENCES membre(id) ON DELETE SET NULL
);

-- Table des parrains/marraines pour les cérémonies
CREATE TABLE parrain_marraine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ceremonie_id INT NOT NULL,
    membre_id INT NOT NULL,
    type_role ENUM('parrain', 'marraine', 'temoin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE,
    FOREIGN KEY (membre_id) REFERENCES membre(id) ON DELETE CASCADE
);

-- Table des organisateurs de cérémonies
CREATE TABLE organisateur_ceremonie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ceremonie_id INT NOT NULL,
    membre_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE,
    FOREIGN KEY (membre_id) REFERENCES membre(id) ON DELETE CASCADE
);

-- Table des trésoriers de cérémonies (pour tours de famille/ziar)
CREATE TABLE tresorier_ceremonie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ceremonie_id INT NOT NULL,
    utilisateur_id INT NOT NULL, -- L'utilisateur désigné comme trésorier
    membre_id INT, -- Le membre correspondant dans l'arbre (optionnel)
    date_designation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (membre_id) REFERENCES membre(id) ON DELETE SET NULL,
    UNIQUE KEY unique_tresorier_ceremonie (ceremonie_id)
);

-- Table des recettes pour cérémonies (cotisations, dons, etc.)
CREATE TABLE recette_ceremonie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ceremonie_id INT NOT NULL,
    type_recette ENUM('cotisation', 'don', 'autre') NOT NULL,
    description VARCHAR(255),
    montant DECIMAL(10,2) NOT NULL,
    contributeur_nom VARCHAR(200), -- Nom du contributeur
    contributeur_membre_id INT, -- Lien avec membre si applicable
    date_recette DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE,
    FOREIGN KEY (contributeur_membre_id) REFERENCES membre(id) ON DELETE SET NULL
);

-- Table des dépenses pour cérémonies
CREATE TABLE depense_ceremonie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ceremonie_id INT NOT NULL,
    rubrique ENUM('bache', 'chaises', 'sonorisation', 'repas', 'honoraires', 'transport', 'habillement', 'autre') NOT NULL,
    description VARCHAR(255),
    montant DECIMAL(10,2) NOT NULL,
    beneficiaire VARCHAR(200), -- Nom du bénéficiaire/fournisseur
    date_depense DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ceremonie_id) REFERENCES ceremonie(id) ON DELETE CASCADE
);

-- Table du musée familial
CREATE TABLE musee_familial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    famille_id INT NOT NULL,
    nom_objet VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    proprietaire_id INT, -- Membre propriétaire de l'objet
    est_commun BOOLEAN DEFAULT FALSE, -- Objet commun à toute la famille
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES famille(id) ON DELETE CASCADE,
    FOREIGN KEY (proprietaire_id) REFERENCES membre(id) ON DELETE SET NULL
);

-- Table des messages de la bande passante (seul l'admin peut publier)
CREATE TABLE bande_passante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    famille_id INT NOT NULL,
    admin_id INT NOT NULL,
    titre VARCHAR(200),
    contenu TEXT NOT NULL,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES famille(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table des abonnements/souscriptions
CREATE TABLE abonnement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    famille_id INT NOT NULL,
    type_abonnement ENUM('mensuel', 'annuel', 'premium') NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    mode_paiement ENUM('orange_money', 'wave', 'paypal', 'virement') NOT NULL,
    reference_paiement VARCHAR(100),
    statut ENUM('actif', 'expire', 'suspendu') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES famille(id) ON DELETE CASCADE
);

-- Table des sessions utilisateur (pour JWT)
CREATE TABLE session_utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    date_expiration TIMESTAMP NOT NULL,
    adresse_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Index pour optimiser les performances
CREATE INDEX idx_famille_statut ON famille(statut);
CREATE INDEX idx_utilisateur_famille ON utilisateur(famille_id);
CREATE INDEX idx_membre_famille ON membre(famille_id);
CREATE INDEX idx_membre_numero ON membre(numero_identification);
CREATE INDEX idx_lien_enfant ON lien_parental(enfant_id);
CREATE INDEX idx_lien_parent ON lien_parental(parent_id);
CREATE INDEX idx_ceremonie_famille ON ceremonie(famille_id);
CREATE INDEX idx_ceremonie_date ON ceremonie(date_ceremonie);
CREATE INDEX idx_musee_famille ON musee_familial(famille_id);
CREATE INDEX idx_bande_famille ON bande_passante(famille_id);
CREATE INDEX idx_recette_ceremonie ON recette_ceremonie(ceremonie_id);
CREATE INDEX idx_depense_ceremonie ON depense_ceremonie(ceremonie_id);
CREATE INDEX idx_organisateur_ceremonie ON organisateur_ceremonie(ceremonie_id);
CREATE INDEX idx_tresorier_ceremonie ON tresorier_ceremonie(ceremonie_id);

-- Triggers pour générer automatiquement les numéros d'identification
DELIMITER //

CREATE TRIGGER generate_numero_identification 
BEFORE INSERT ON membre
FOR EACH ROW
BEGIN
    DECLARE next_num INT;
    DECLARE famille_prefix VARCHAR(10);
    
    -- Récupérer le préfixe de la famille (3 premières lettres du nom)
    SELECT UPPER(LEFT(nom, 3)) INTO famille_prefix FROM famille WHERE id = NEW.famille_id;
    
    -- Trouver le prochain numéro pour cette famille
    SELECT COALESCE(MAX(CAST(RIGHT(numero_identification, 4) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM membre 
    WHERE famille_id = NEW.famille_id;
    
    -- Générer le numéro d'identification
    SET NEW.numero_identification = CONCAT(famille_prefix, LPAD(next_num, 4, '0'));
END//

DELIMITER ;








-- =========================================================================================
