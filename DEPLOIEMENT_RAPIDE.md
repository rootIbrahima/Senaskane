# ⚡ DÉPLOIEMENT RAPIDE - 30 MINUTES

## 🎯 ÉTAPE 1: BASE DE DONNÉES (5 min)

### Railway.app - Base MySQL Gratuite

```bash
1. Allez sur https://railway.app/
2. Se connecter avec GitHub
3. "New Project" → "Provision MySQL"
4. Notez les informations de connexion
```

---

## 🚀 ÉTAPE 2: BACKEND SUR RENDER.COM (10 min)

### A. Pusher sur GitHub

```bash
cd c:\Users\lyibr\Desktop\MrSall\Senaskane

# Vérifier les fichiers à commiter
git status

# Ajouter tous les fichiers
git add .

# Commiter
git commit -m "Préparation déploiement"

# Créer un repo sur GitHub.com puis:
git remote add origin https://github.com/VOTRE_USERNAME/senaskane.git
git branch -M main
git push -u origin main
```

### B. Déployer sur Render

```bash
1. Allez sur https://render.com/
2. Se connecter avec GitHub
3. "New +" → "Web Service"
4. Sélectionner votre repo GitHub
```

**Configuration:**
- Name: `senaskane-backend`
- Root Directory: `backend`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `node server.js`
- Instance Type: `Free`

**Variables d'environnement (Important!):**

```
DB_HOST=<votre_host_railway>
DB_USER=<votre_user_railway>
DB_PASSWORD=<votre_password_railway>
DB_NAME=<votre_database_railway>
JWT_SECRET=super_secret_jwt_change_me_in_production_123456789
PORT=3000
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lyibrahima321@gmail.com
SMTP_PASS=rzmt bdpq pmwb lxsk
EMAIL_FROM="Senaskane <noreply@senaskane.com>"
APP_URL=https://senaskane-backend.onrender.com
ALLOWED_ORIGINS=*
```

5. Cliquez "Create Web Service"
6. Attendez 5-10 minutes

**Votre API sera à:** `https://senaskane-backend.onrender.com/api`

---

## �� ÉTAPE 3: GÉNÉRER L'APK (15 min)

### A. Mettre à jour l'URL de l'API

Éditez `mobile-app/eas.json` ligne 22:

```json
"API_URL": "https://VOTRE-APP.onrender.com/api"
```

### B. Installer EAS CLI

```bash
npm install -g eas-cli
```

### C. Se connecter à Expo

```bash
cd c:\Users\lyibr\Desktop\MrSall\Senaskane\mobile-app
eas login
```

Créez un compte sur https://expo.dev si besoin.

### D. Générer l'APK

```bash
# Build de production
eas build -p android --profile production
```

⏱️ Le build prend environ **15-20 minutes** sur les serveurs Expo.

### E. Télécharger l'APK

Une fois terminé:
1. Vous recevrez un email avec le lien
2. OU allez sur https://expo.dev/ → Projects → Builds
3. Téléchargez l'APK

---

## 📲 ÉTAPE 4: INSTALLER L'APK

1. **Transférez l'APK** sur votre téléphone Android
2. **Activez les sources inconnues:**
   - Paramètres → Sécurité → Sources inconnues
3. **Installez l'APK** en cliquant dessus

---

## ✅ VÉRIFICATION

### Tester l'API:

```bash
curl https://VOTRE-APP.onrender.com/api/auth/verify
```

### Tester l'APP:
- Ouvrez l'app sur votre téléphone
- Essayez de vous connecter
- Vérifiez toutes les fonctionnalités

---

## 🐛 PROBLÈMES COURANTS

### "API non accessible"
→ Vérifiez que Render a bien déployé (logs sur render.com)
→ Testez l'URL avec curl

### "Build Expo échoue"
→ Vérifiez que `icon.png` et `splash.jpg` existent dans `assets/`
→ Consultez les logs sur expo.dev

### "APK ne s'installe pas"
→ Activez les sources inconnues
→ Réessayez le téléchargement

---

## 📞 COMMANDES UTILES

```bash
# Voir les logs Render
# Dashboard → Votre service → Logs

# Voir les builds Expo
eas build:list

# Tester l'API locale
curl http://localhost:3000/api/auth/verify

# Rebuild APK
eas build -p android --profile production --clear-cache
```

---

## 🎉 C'EST TERMINÉ !

Vous avez maintenant:
- ✅ Backend déployé sur Render
- ✅ Base de données MySQL sur Railway
- ✅ APK Android généré

**Partagez l'APK avec vos clients et testez !**
