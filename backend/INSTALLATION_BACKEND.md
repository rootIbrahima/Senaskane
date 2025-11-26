# 🚀 Installation et Configuration du Backend Senaskane

## 📋 Prérequis

- ✅ XAMPP installé
- ✅ Node.js installé
- ✅ Code du backend cloné depuis GitHub

---

## 🗄️ Étape 1 : Configurer MySQL avec XAMPP

### 1.1 Démarrer XAMPP

1. **Ouvrir XAMPP Control Panel**
2. **Démarrer Apache** (bouton "Start")
3. **Démarrer MySQL** (bouton "Start")

Les deux doivent afficher un fond **vert** quand ils sont démarrés.

### 1.2 Créer la base de données

**Option A : Avec phpMyAdmin (Interface graphique)**

1. Cliquer sur **"Admin"** à côté de MySQL dans XAMPP
2. Cela ouvre **phpMyAdmin** dans le navigateur
3. Cliquer sur l'onglet **"SQL"** en haut
4. **Copier-coller** tout le contenu du fichier `bd.sql`
5. Cliquer sur **"Exécuter"**

**Option B : Avec la ligne de commande**

```bash
# Aller dans le dossier MySQL de XAMPP
cd C:\xampp\mysql\bin

# Se connecter à MySQL (mot de passe vide par défaut sur XAMPP)
mysql -u root -p

# Appuyer sur Entrée (pas de mot de passe)

# Copier-coller le contenu de bd.sql
# Ou importer le fichier directement :
source C:\Users\lyibr\Desktop\MrSall\Senaskane\backend\bd.sql
```

---

## 🔧 Étape 2 : Configurer le fichier .env

Le fichier `.env` contient les informations de connexion à la base de données.

### 2.1 Vérifier/Modifier le .env

Ouvrir le fichier `backend/.env` et vérifier ces lignes :

```env
# Configuration MySQL pour XAMPP
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=senaskane_db

# JWT Secret (laisser tel quel)
JWT_SECRET=votre_secret_jwt_ici

# Port du serveur
PORT=3000
NODE_ENV=development

# Configuration Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app
EMAIL_FROM="Senaskane <noreply@senaskane.com>"

# URL de l'application
APP_URL=http://localhost:3000
```

### 2.2 Paramètres importants pour XAMPP :

- **DB_HOST** : `localhost` ✅
- **DB_USER** : `root` ✅
- **DB_PASSWORD** : vide (rien après le `=`) ✅
- **DB_NAME** : `senaskane_db` ✅

---

## 📦 Étape 3 : Installer les dépendances Node.js

Ouvrir un terminal dans le dossier backend :

```bash
cd C:\Users\lyibr\Desktop\MrSall\Senaskane\backend
npm install
```

Attendez que toutes les dépendances soient installées.

---

## 🚀 Étape 4 : Démarrer le serveur

```bash
cd C:\Users\lyibr\Desktop\MrSall\Senaskane\backend
node server.js
```

Vous devriez voir :

```
==================================================
🌳 SENASKANE API DÉMARRÉE
==================================================
📍 URL: http://0.0.0.0:3000
🌍 Environnement: development
📅 Date: 18/12/2024 23:45:00
==================================================
📚 Endpoints disponibles:
   - Health Check: http://localhost:3000/health
   - Auth: http://localhost:3000/api/auth
   - Famille: http://localhost:3000/api/famille
   - Membre: http://localhost:3000/api/membre
   ...
==================================================
```

---

## ✅ Étape 5 : Vérifier que tout fonctionne

### Test 1 : Health Check

Ouvrir un navigateur et aller sur :
```
http://localhost:3000/health
```

Vous devriez voir :
```json
{
  "status": "OK",
  "timestamp": "2024-12-18T22:45:00.000Z",
  "uptime": 10.5,
  "environment": "development"
}
```

### Test 2 : Vérifier la base de données

Dans phpMyAdmin :
1. Cliquer sur **senaskane_db** à gauche
2. Vous devriez voir toutes les tables :
   - famille
   - utilisateur
   - membre
   - ceremonie
   - musee_familial
   - bande_passante
   - etc.

---

## 🐛 Dépannage

### ❌ Erreur : "Cannot connect to MySQL"

**Solution :**
1. Vérifier que MySQL est démarré dans XAMPP (fond vert)
2. Vérifier le `.env` :
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   ```
3. Redémarrer MySQL dans XAMPP

### ❌ Erreur : "Database 'senaskane_db' doesn't exist"

**Solution :**
La base de données n'a pas été créée. Relancer le fichier SQL :

```bash
# Dans phpMyAdmin, onglet SQL, copier-coller bd.sql
# Ou en ligne de commande :
cd C:\xampp\mysql\bin
mysql -u root
source C:\Users\lyibr\Desktop\MrSall\Senaskane\backend\bd.sql
```

### ❌ Erreur : "Port 3000 already in use"

**Solution :**
Un autre processus utilise le port 3000.

```bash
# Windows : Tuer le processus sur le port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Ou changer le port dans .env
PORT=3001
```

### ❌ Erreur : "Module not found"

**Solution :**
Les dépendances ne sont pas installées.

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Commandes utiles

### Démarrer le backend
```bash
cd backend
node server.js
```

### Avec redémarrage automatique (nodemon)
```bash
cd backend
npm install -g nodemon
nodemon server.js
```

### Arrêter le serveur
Appuyer sur `Ctrl + C` dans le terminal

### Vérifier que MySQL tourne
```bash
# Dans XAMPP, MySQL doit avoir un fond vert
```

### Réinitialiser la base de données
```sql
-- Dans phpMyAdmin, onglet SQL :
DROP DATABASE IF EXISTS senaskane_db;
-- Puis re-copier tout le contenu de bd.sql et exécuter
```

---

## 🔐 Sécurité (pour la production)

### Changer le mot de passe MySQL (optionnel)

1. Dans phpMyAdmin > Comptes utilisateurs
2. Modifier l'utilisateur `root`
3. Définir un mot de passe
4. Mettre à jour le `.env` :
   ```env
   DB_PASSWORD=votre_nouveau_mot_de_passe
   ```

### Générer un nouveau JWT_SECRET

```bash
# Générer une clé aléatoire
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copier le résultat dans .env
JWT_SECRET=la_cle_generee
```

---

## 📊 Structure de la base de données

Tables créées par `bd.sql` :

- **famille** : Informations des familles
- **utilisateur** : Comptes admin et membres
- **membre** : Personnes dans l'arbre généalogique
- **lien_parental** : Relations père/mère
- **ceremonie** : Événements familiaux
- **parrain_marraine** : Parrains des cérémonies
- **musee_familial** : Objets du musée
- **bande_passante** : Actualités
- **abonnement** : Gestion des souscriptions
- **session_utilisateur** : Sessions JWT

---

## ✅ Checklist finale

- [ ] XAMPP installé et démarré
- [ ] MySQL démarré (fond vert dans XAMPP)
- [ ] Base de données `senaskane_db` créée via `bd.sql`
- [ ] Fichier `.env` configuré correctement
- [ ] Dépendances installées (`npm install`)
- [ ] Serveur démarré (`node server.js`)
- [ ] Health check fonctionne (`http://localhost:3000/health`)
- [ ] Tables visibles dans phpMyAdmin

---

## 🎉 C'est tout !

Votre backend est maintenant opérationnel !

**Prochaine étape :**
Démarrer l'application mobile et se connecter au backend.

---

## 📞 Aide rapide

### Vérifier que tout fonctionne :

1. **XAMPP** : MySQL doit avoir un fond **vert**
2. **Terminal backend** : Doit afficher "🌳 SENASKANE API DÉMARRÉE"
3. **Navigateur** : `http://localhost:3000/health` doit retourner `{"status":"OK"}`
4. **phpMyAdmin** : La base `senaskane_db` doit contenir ~15 tables

Si tous ces points sont OK, le backend fonctionne ! ✅
