# 🚀 Guide Complet - Démarrage de Senaskane

## 📋 Vue d'ensemble

Vous avez 2 parties à démarrer :
1. **Backend** (serveur API sur le PC)
2. **Mobile App** (application sur le téléphone)

---

## 🗄️ PARTIE 1 : Configuration du Backend

### Étape 1 : Démarrer XAMPP

1. **Ouvrir XAMPP Control Panel**
2. Cliquer sur **"Start"** pour :
   - ✅ **Apache** (doit devenir VERT)
   - ✅ **MySQL** (doit devenir VERT)

### Étape 2 : Créer la base de données

**Méthode Simple (Recommandée) :**

1. Dans XAMPP, cliquer sur **"Admin"** à côté de MySQL
2. Cela ouvre **phpMyAdmin** dans le navigateur
3. Cliquer sur l'onglet **"SQL"** en haut
4. **Ouvrir le fichier** `Senaskane\backend\bd.sql` avec un éditeur de texte
5. **Copier tout le contenu** du fichier
6. **Coller** dans la zone de texte de phpMyAdmin
7. Cliquer sur **"Exécuter"** en bas à droite

✅ Vous devriez voir : "La requête a été exécutée avec succès"

**Méthode Alternative (Script automatique) :**

1. Double-cliquer sur `Senaskane\backend\setup-database.bat`
2. Appuyer sur **ENTRÉE** quand le mot de passe est demandé
3. ✅ La base est créée automatiquement

### Étape 3 : Vérifier le fichier .env

Ouvrir `Senaskane\backend\.env` et vérifier :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=senaskane_db
PORT=3000
```

**IMPORTANT :** `DB_PASSWORD=` doit être vide (rien après le =)

### Étape 4 : Installer les dépendances

Ouvrir un terminal (PowerShell ou CMD) :

```bash
cd C:\Users\lyibr\Desktop\MrSall\Senaskane\backend
npm install
```

Attendre la fin de l'installation.

### Étape 5 : Démarrer le serveur

Dans le même terminal :

```bash
node server.js
```

✅ **Vous devriez voir :**

```
==================================================
🌳 SENASKANE API DÉMARRÉE
==================================================
📍 URL: http://0.0.0.0:3000
...
```

**Laisser ce terminal ouvert !** Le serveur doit tourner en permanence.

### Étape 6 : Tester que ça fonctionne

Ouvrir un navigateur et aller sur :
```
http://localhost:3000/health
```

✅ **Vous devez voir :**
```json
{"status":"OK","timestamp":"...","uptime":...}
```

---

## 📱 PARTIE 2 : Démarrage de l'Application Mobile

### Prérequis

- ✅ Backend démarré (étape ci-dessus)
- ✅ Expo Go installé sur le téléphone (SDK 54)
- ✅ PC et téléphone sur le même WiFi

### Étape 1 : Ouvrir un NOUVEAU terminal

**Important :** Gardez le terminal du backend ouvert, ouvrez-en un nouveau.

### Étape 2 : Aller dans le dossier mobile

```bash
cd C:\Users\lyibr\Desktop\MrSall\Senaskane\mobile-app
```

### Étape 3 : Démarrer Expo en mode Tunnel

```bash
npx expo start --tunnel
```

**Attendez** de voir :

```
› Metro waiting on exp://...
› Tunnel ready
```

Un **QR code** va s'afficher.

### Étape 4 : Scanner avec Expo Go

1. Sur votre téléphone, **ouvrir Expo Go**
2. Appuyer sur **"Scan QR code"**
3. **Scanner le QR code** du terminal
4. **Attendre** 30-60 secondes (première fois)

✅ **L'application Senaskane va s'ouvrir !**

---

## 🎯 Résumé Visual

```
┌─────────────────────────────────────────┐
│           VOTRE PC                      │
│                                         │
│  Terminal 1 (Backend)                   │
│  > cd backend                           │
│  > node server.js                       │
│  ✅ API démarrée sur port 3000          │
│                                         │
│  Terminal 2 (Mobile App)                │
│  > cd mobile-app                        │
│  > npx expo start --tunnel              │
│  📱 QR Code affiché                     │
│                                         │
│  XAMPP Control Panel                    │
│  ✅ MySQL: VERT                         │
│  ✅ Apache: VERT                        │
└─────────────────────────────────────────┘
                    ↓
            Même réseau WiFi
                    ↓
┌─────────────────────────────────────────┐
│        VOTRE TÉLÉPHONE                  │
│                                         │
│  Expo Go (SDK 54)                       │
│  > Scan QR code                         │
│  ✅ App Senaskane chargée               │
│                                         │
│  Écran de Login :                       │
│  🌳 Senaskane                           │
│  [Identifiant]                          │
│  [Mot de passe]                         │
│  [Se connecter]                         │
└─────────────────────────────────────────┘
```

---

## 🔍 Vérifications Importantes

### ✅ Checklist Backend

- [ ] XAMPP ouvert et MySQL démarré (VERT)
- [ ] Base de données `senaskane_db` créée dans phpMyAdmin
- [ ] Fichier `.env` configuré (DB_PASSWORD vide)
- [ ] `npm install` exécuté dans le dossier backend
- [ ] `node server.js` lancé et affiche "API DÉMARRÉE"
- [ ] `http://localhost:3000/health` retourne `{"status":"OK"}`

### ✅ Checklist Mobile

- [ ] `npm install` exécuté dans le dossier mobile-app
- [ ] Assets créés (icon.png, splash.png, etc.)
- [ ] Config.js a la bonne IP (192.168.1.111)
- [ ] `npx expo start --tunnel` lancé
- [ ] QR code visible dans le terminal
- [ ] Expo Go SDK 54 installé sur le téléphone
- [ ] QR code scanné avec Expo Go

---

## 🐛 Problèmes Courants

### ❌ Backend : "Cannot connect to database"

**Solution :**
1. Vérifier que MySQL est VERT dans XAMPP
2. Vérifier le `.env` : `DB_PASSWORD=` (vide)
3. Recréer la base de données via phpMyAdmin

### ❌ Backend : "Port 3000 already in use"

**Solution :**
```bash
# Tuer le processus
taskkill /F /IM node.exe

# Ou changer le port dans .env
PORT=3001
```

### ❌ Mobile : "Site inaccessible"

**Solution :**
Utiliser le mode tunnel (déjà fait) :
```bash
npx expo start --tunnel
```

### ❌ Mobile : "Incompatible SDK version"

**Solution :**
✅ Déjà résolu ! Package.json mis à jour vers SDK 54

### ❌ Mobile : "Network request failed"

**Solutions :**
1. Vérifier que le backend tourne (`http://localhost:3000/health`)
2. Vérifier l'IP dans `mobile-app/src/utils/config.js`
3. Désactiver temporairement le pare-feu Windows

---

## 📞 Commandes Rapides

### Démarrer le Backend
```bash
cd C:\Users\lyibr\Desktop\MrSall\Senaskane\backend
node server.js
```

### Démarrer l'App Mobile (Mode Tunnel)
```bash
cd C:\Users\lyibr\Desktop\MrSall\Senaskane\mobile-app
npx expo start --tunnel
```

### Arrêter tout
- Backend : `Ctrl + C` dans le terminal
- Mobile : `Ctrl + C` dans le terminal
- XAMPP : Cliquer sur "Stop" pour MySQL et Apache

---

## 🎉 Première Connexion

Une fois l'app ouverte sur votre téléphone :

### Option 1 : Créer un compte

1. Appuyer sur **"Créer un compte"**
2. Remplir le formulaire :
   - Nom de la famille : `Diop`
   - Identifiant : `admin_diop`
   - Mot de passe : `test123`
   - Nom : `Diop`
   - Prénom : `Amadou`
   - Email : `test@example.com`
3. Appuyer sur **"S'inscrire"**
4. Se connecter avec `admin_diop` / `test123`

### Option 2 : Se connecter (si compte existe)

1. Entrer l'identifiant
2. Entrer le mot de passe
3. Appuyer sur **"Se connecter"**

---

## ✅ Résultat Attendu

Après connexion, vous verrez :

```
┌─────────────────────────────────┐
│  Accueil              ☰         │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Bienvenue                 │  │
│  │ Famille Diop Amadou       │  │
│  │ Administrateur       🌳   │  │
│  └───────────────────────────┘  │
│                                 │
│  Accès rapide                   │
│  [Membres] [Arbre]              │
│  [Cérémonies] [Musée]           │
│  [Actualités] [Cotisations]     │
└─────────────────────────────────┘
```

---

## 📚 Documentation Complète

- **Backend** : `backend/INSTALLATION_BACKEND.md`
- **Mobile** : `mobile-app/README.md`
- **Démarrage rapide** : `mobile-app/GUIDE_DEMARRAGE.md`
- **Architecture** : `mobile-app/ARCHITECTURE.md`
- **SDK 54** : `mobile-app/MISE_A_JOUR_SDK54.md`
- **Problèmes de connexion** : `mobile-app/SOLUTION_CONNEXION.md`

---

## 🎯 Ordre d'exécution

**1. XAMPP** → Démarrer MySQL et Apache
**2. Base de données** → Créer via phpMyAdmin ou script
**3. Backend** → `node server.js`
**4. Mobile** → `npx expo start --tunnel`
**5. Téléphone** → Scanner QR code avec Expo Go

---

**C'est tout ! Vous êtes prêt à utiliser Senaskane ! 🎉**
