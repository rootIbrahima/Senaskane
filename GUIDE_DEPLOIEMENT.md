# GUIDE DE DEPLOIEMENT - BAILA GENEA / SENASKANE

Ce guide explique comment deployer:
- **Backend (API)** sur Render
- **Frontend (Web App)** sur Vercel

---

## PREREQUIS

- Compte GitHub avec le code pousse
- Compte Render.com (gratuit)
- Compte Vercel.com (gratuit)
- Base de donnees MySQL (Railway, PlanetScale, ou autre)

---

## PARTIE 1: PUSH GITHUB (Mise a jour du code)

### Si le repo existe deja (mise a jour):

```bash
cd c:\Users\lyibr\Desktop\MrSall\Senaskane

# Voir les fichiers modifies
git status

# Ajouter tous les fichiers modifies
git add .

# Creer un commit
git commit -m "Mise a jour: optimisations performance et config deploiement"

# Pousser vers GitHub
git push origin main
```

### Si c'est la premiere fois:

```bash
cd c:\Users\lyibr\Desktop\MrSall\Senaskane

# Initialiser git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Baila Genea"

# Ajouter le remote (remplacer par votre URL)
git remote add origin https://github.com/VOTRE-USERNAME/senaskane.git

# Pousser
git branch -M main
git push -u origin main
```

---

## PARTIE 2: DEPLOYER LE BACKEND SUR RENDER

### Si Render est deja configure (mise a jour automatique):

Render se met a jour automatiquement quand vous faites `git push`.
Attendez 2-3 minutes et verifiez les logs sur render.com.

### Pour forcer un nouveau deploiement:

1. Allez sur https://dashboard.render.com
2. Selectionnez votre service backend
3. Cliquez sur "Manual Deploy" -> "Deploy latest commit"

### Si c'est la premiere fois sur Render:

1. **Allez sur** https://render.com et connectez-vous

2. **Cliquez** "New +" -> "Web Service"

3. **Connectez** votre repository GitHub

4. **Configuration**:
   ```
   Name: senaskane-api
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Variables d'environnement** (onglet Environment):
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=votre-host-mysql
   DB_USER=votre-user
   DB_PASSWORD=votre-password
   DB_NAME=senaskane_db
   DB_PORT=3306
   JWT_SECRET=votre-secret-jwt-64-caracteres
   ALLOWED_ORIGINS=https://baila-genea.vercel.app
   ```

6. **Cliquez** "Create Web Service"

7. **Notez l'URL** de votre API (ex: https://senaskane-api.onrender.com)

### Tester l'API:

Ouvrez dans le navigateur:
```
https://senaskane-api.onrender.com/health
```

Vous devez voir:
```json
{"status":"OK","timestamp":"...","environment":"production"}
```

---

## PARTIE 3: DEPLOYER LE FRONTEND SUR VERCEL

### Etape 1: Creer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez "Sign Up" -> "Continue with GitHub"
3. Autorisez Vercel a acceder a vos repos

### Etape 2: Importer le projet

1. Cliquez "Add New..." -> "Project"
2. Selectionnez votre repository "senaskane"
3. **Configuration importante**:
   ```
   Framework Preset: Vite
   Root Directory: web-app     <-- IMPORTANT!
   Build Command: npm run build
   Output Directory: dist
   ```

### Etape 3: Variables d'environnement

Avant de deployer, ajoutez cette variable:

```
VITE_API_URL = https://senaskane-api.onrender.com/api
```

(Remplacez par l'URL de votre API Render)

### Etape 4: Deployer

1. Cliquez "Deploy"
2. Attendez 1-2 minutes
3. Votre site sera accessible a: https://votre-projet.vercel.app

### Mise a jour du frontend:

Vercel se met a jour automatiquement a chaque `git push`.

---

## PARTIE 4: CONFIGURER CORS (Important!)

Apres avoir deploye sur Vercel, retournez sur Render:

1. Dashboard Render -> Votre service -> Environment
2. Modifiez `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://baila-genea.vercel.app,https://votre-projet.vercel.app
   ```
3. Cliquez "Save Changes"
4. Le service va redemarrer automatiquement

---

## RESUME DES COMMANDES GIT

```bash
# Aller dans le dossier du projet
cd c:\Users\lyibr\Desktop\MrSall\Senaskane

# Voir ce qui a change
git status

# Ajouter les modifications
git add .

# Commit avec message
git commit -m "Description de vos changements"

# Pousser vers GitHub (declenche auto-deploy)
git push origin main
```

---

## VERIFICATION FINALE

### Backend (Render):
- [ ] https://votre-api.onrender.com/health repond OK
- [ ] Variables d'environnement configurees
- [ ] ALLOWED_ORIGINS contient l'URL Vercel

### Frontend (Vercel):
- [ ] Site accessible
- [ ] Variable VITE_API_URL configuree
- [ ] Connexion fonctionne

---

## DEPANNAGE

### "CORS error" dans la console:
-> Verifiez ALLOWED_ORIGINS sur Render

### "Network error" ou API ne repond pas:
-> Verifiez que l'API Render est en ligne (peut prendre 30s au reveil)

### Page blanche sur Vercel:
-> Verifiez que Root Directory = web-app

### Build echoue:
-> Regardez les logs sur Vercel/Render pour l'erreur exacte

---

## URLS A RETENIR

| Service | URL |
|---------|-----|
| Backend API | https://senaskane-api.onrender.com |
| Frontend Web | https://baila-genea.vercel.app |
| Health Check | https://senaskane-api.onrender.com/health |

---

## FICHIERS DE CONFIGURATION CREES

| Fichier | Usage |
|---------|-------|
| backend/render.yaml | Config Render |
| backend/Procfile | Commande demarrage |
| backend/.gitignore | Fichiers ignores |
| web-app/vercel.json | Config Vercel |
| web-app/.env.production | Variables prod |
| web-app/src/services/api.js | URL API dynamique |
