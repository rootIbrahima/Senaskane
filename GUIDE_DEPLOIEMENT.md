# 🚀 GUIDE DE DÉPLOIEMENT - SENASKANE

Ce guide vous aidera à déployer le backend et générer l'APK de l'application mobile.

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Déploiement du Backend](#déploiement-du-backend)
3. [Configuration de l'Application Mobile](#configuration-de-lapplication-mobile)
4. [Génération de l'APK](#génération-de-lapk)

---

## ✅ PRÉREQUIS

- Compte GitHub (gratuit)
- Compte Render.com (gratuit)
- Compte Expo (gratuit)
- Node.js installé
- Git installé

---

## 🌐 DÉPLOIEMENT DU BACKEND

### Étape 1: Préparer la base de données

#### Option A: Railway.app (Recommandé - Gratuit)

1. Allez sur https://railway.app/
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project" → "Provision MySQL"
4. Une fois créée, cliquez sur votre base MySQL
5. Onglet "Connect" → Copiez les informations de connexion

#### Option B: FreeMySQLHosting.net (Alternative gratuite)

1. Allez sur https://www.freemysqlhosting.net/
2. Créez un compte gratuit
3. Créez une nouvelle base de données
4. Notez les informations de connexion

### Étape 2: Importer la base de données

1. Connectez-vous à votre base MySQL distante
2. Importez votre fichier SQL local:

```bash
# Si vous avez une sauvegarde
mysql -h [DB_HOST] -u [DB_USER] -p[DB_PASSWORD] [DB_NAME] < backup.sql
```

OU créez les tables manuellement via phpMyAdmin/MySQL Workbench

### Étape 3: Déployer sur Render.com

1. **Créer un compte sur Render.com**
   - Allez sur https://render.com/
   - Connectez-vous avec GitHub

2. **Pousser le code sur GitHub**

```bash
cd c:\Users\lyibr\Desktop\MrSall\Senaskane

# Initialiser git si ce n'est pas déjà fait
git init
git add .
git commit -m "Préparation pour le déploiement"

# Créer un nouveau repository sur GitHub, puis:
git remote add origin https://github.com/votre-username/senaskane.git
git branch -M main
git push -u origin main
```

3. **Configurer Render**
   - Sur Render.com, cliquez "New +" → "Web Service"
   - Connectez votre repository GitHub
   - Configuration:
     - **Name**: `senaskane-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: `Free`

4. **Ajouter les variables d'environnement**

   Dans l'onglet "Environment" de Render, ajoutez:

   ```
   DB_HOST=votre_host_railway
   DB_USER=votre_user
   DB_PASSWORD=votre_password
   DB_NAME=votre_database
   JWT_SECRET=votre_secret_jwt_securise
   PORT=3000
   NODE_ENV=production
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre_email@gmail.com
   SMTP_PASS=votre_app_password
   EMAIL_FROM="Senaskane <noreply@senaskane.com>"
   APP_URL=https://senaskane-backend.onrender.com
   ALLOWED_ORIGINS=*
   ```

5. **Déployer**
   - Cliquez sur "Create Web Service"
   - Attendez que le déploiement se termine (5-10 minutes)
   - Votre API sera accessible à: `https://senaskane-backend.onrender.com`

### Étape 4: Tester l'API

```bash
# Tester que l'API fonctionne
curl https://senaskane-backend.onrender.com/api/auth/verify
```

---

## 📱 CONFIGURATION DE L'APPLICATION MOBILE

### Étape 1: Installer expo-constants

```bash
cd mobile-app
npx expo install expo-constants
```

### Étape 2: Créer le fichier app.config.js

Créez `mobile-app/app.config.js`:

```javascript
export default {
  expo: {
    name: "Senaskane",
    slug: "senaskane",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.jpg",
      resizeMode: "contain",
      backgroundColor: "#2E7D32"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.senaskane.app"
    },
    android: {
      package: "com.senaskane.app",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#2E7D32"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.API_URL || "https://senaskane-backend.onrender.com/api"
    }
  }
};
```

### Étape 3: Modifier config.js

Modifiez `mobile-app/src/utils/config.js`:

```javascript
import Constants from 'expo-constants';

// Configuration de l'application
export const API_URL = Constants.expoConfig?.extra?.apiUrl ||
  'https://senaskane-backend.onrender.com/api';

export const COLORS = {
  // ... reste du code
};
```

---

## 📦 GÉNÉRATION DE L'APK

### Étape 1: Installer EAS CLI

```bash
npm install -g eas-cli
```

### Étape 2: Se connecter à Expo

```bash
cd mobile-app
eas login
```

Créez un compte sur https://expo.dev si vous n'en avez pas.

### Étape 3: Configurer EAS Build

```bash
eas build:configure
```

Cela créera `eas.json`. Modifiez-le:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Étape 4: Générer l'APK

```bash
# Pour un build de preview (test)
eas build -p android --profile preview

# Pour un build de production
eas build -p android --profile production
```

**Note**: Le build prend environ 15-20 minutes sur les serveurs Expo.

### Étape 5: Télécharger l'APK

Une fois le build terminé:
- Vous recevrez un email avec le lien de téléchargement
- OU visitez https://expo.dev/ → Projects → Builds
- Téléchargez l'APK

### Étape 6: Installer sur votre téléphone

1. **Transférez l'APK sur votre téléphone** (USB, email, Drive, etc.)
2. **Activez les sources inconnues**:
   - Paramètres → Sécurité → Sources inconnues → Activez
3. **Installez l'APK** en cliquant dessus

---

## 🔐 SÉCURITÉ IMPORTANTE

⚠️ **AVANT DE DÉPLOYER EN PRODUCTION:**

1. **Changez le JWT_SECRET** dans les variables d'environnement
2. **Configurez CORS correctement** - Ne laissez pas `*` en production
3. **Utilisez HTTPS** pour l'API
4. **Ne commitez JAMAIS le fichier .env**
5. **Créez un nouveau mot de passe d'application Gmail** pour SMTP

### Générer un JWT_SECRET sécurisé:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📱 TESTER L'APPLICATION

1. **Installez l'APK** sur votre téléphone Android
2. **Testez toutes les fonctionnalités**:
   - Inscription / Connexion
   - Ajout de membres
   - Création de cérémonies
   - Upload d'images
   - Arbre généalogique
   - Musée familial

---

## 🐛 DÉPANNAGE

### L'API ne répond pas

```bash
# Vérifiez les logs sur Render
# Dashboard → Votre service → Logs
```

### L'app ne se connecte pas à l'API

- Vérifiez que l'URL dans `config.js` est correcte
- Testez l'API manuellement: `curl https://votre-api.com/api/auth/verify`
- Vérifiez que CORS est configuré correctement

### Le build Expo échoue

- Vérifiez que `app.config.js` est correct
- Assurez-vous que tous les assets existent (icon.png, splash.jpg)
- Consultez les logs du build sur expo.dev

---

## 📞 SUPPORT

Pour toute question, vérifiez:
- Les logs Render pour le backend
- Les logs Expo pour le build mobile
- La console du navigateur pour les erreurs frontend

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### Backend
- [ ] Base de données MySQL créée et importée
- [ ] Code pushé sur GitHub
- [ ] Service Render créé et configuré
- [ ] Variables d'environnement ajoutées
- [ ] API testée et fonctionnelle

### Mobile
- [ ] expo-constants installé
- [ ] app.config.js créé
- [ ] config.js modifié avec la bonne URL API
- [ ] EAS CLI installé
- [ ] Compte Expo créé
- [ ] APK généré et téléchargé
- [ ] APK testé sur un appareil physique

---

**Bonne chance avec votre déploiement ! 🎉**
