# Guide de Démarrage Rapide - Senaskane Mobile

## ⚡ Démarrage en 5 minutes

### 1️⃣ Installer les dépendances

```bash
cd Senaskane/mobile-app
npm install
```

### 2️⃣ Configurer l'URL du backend

Ouvrez `src/utils/config.js` et modifiez :

```javascript
export const API_URL = 'http://VOTRE_IP_LOCALE:3000/api';
```

**Comment trouver votre IP locale ?**

**Windows :**
```bash
ipconfig
```
Cherchez "Adresse IPv4" (exemple : 192.168.1.100)

**Mac/Linux :**
```bash
ifconfig
```
Cherchez l'IP de votre interface WiFi/Ethernet

**Exemple final :**
```javascript
export const API_URL = 'http://192.168.1.100:3000/api';
```

### 3️⃣ Démarrer le backend

Dans un autre terminal :
```bash
cd Senaskane/backend
node server.js
```

Vous devriez voir :
```
🌳 SENASKANE API DÉMARRÉE
📍 URL: http://0.0.0.0:3000
```

### 4️⃣ Démarrer l'application mobile

```bash
cd Senaskane/mobile-app
npm start
```

### 5️⃣ Scanner le QR code

1. Installez **Expo Go** sur votre téléphone :
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Scannez le QR code affiché dans le terminal avec :
   - **Android** : App Expo Go > Scan QR Code
   - **iOS** : App Appareil Photo (la notification Expo Go apparaîtra)

3. L'application se charge automatiquement !

## 🎯 Premier test

### Créer un compte de test

1. Appuyez sur "Créer un compte"
2. Remplissez le formulaire :
   - Nom de la famille : `Diop`
   - Identifiant : `admin_diop`
   - Mot de passe : `test123`
   - Nom : `Diop`
   - Prénom : `Amadou`
   - Email : `test@example.com`

3. Appuyez sur "S'inscrire"
4. Connectez-vous avec vos identifiants

### Tester les fonctionnalités

✅ **Accueil** : Voir les statistiques et le menu
✅ **Membres** : Appuyez sur le bouton + pour ajouter un membre
✅ **Cérémonies** : Enregistrer des événements familiaux
✅ **Musée** : Ajouter des objets avec photos
✅ **Recherche** : Chercher des membres par nom

## 🔧 Problèmes courants

### ❌ "Network request failed"

**Solution 1 : Vérifier l'IP**
```bash
# Testez dans un navigateur sur votre téléphone
http://VOTRE_IP:3000/health
```
Vous devriez voir : `{"status":"OK",...}`

**Solution 2 : Même réseau WiFi**
- Assurez-vous que votre téléphone et PC sont sur le même WiFi

**Solution 3 : Pare-feu**
- Désactivez temporairement le pare-feu Windows

### ❌ "Unable to resolve module"

```bash
# Nettoyer le cache
expo start -c

# Ou réinstaller
rm -rf node_modules
npm install
```

### ❌ Le backend ne démarre pas

```bash
# Vérifier que MySQL est démarré
# Vérifier le fichier backend/.env

# Recréer la base de données
mysql -u amadou -p < backend/bd.sql
```

### ❌ L'application ne se charge pas

1. Fermez Expo Go complètement
2. Redémarrez le serveur Expo : `npm start`
3. Scannez à nouveau le QR code

## 📱 Raccourcis Expo

Dans le terminal Expo, appuyez sur :
- `r` : Recharger l'application
- `m` : Ouvrir le menu développeur
- `c` : Nettoyer le cache
- `d` : Ouvrir les outils de développement

## 🎨 Personnalisation rapide

### Changer les couleurs

`src/utils/config.js` :
```javascript
export const COLORS = {
  primary: '#2E7D32',      // Vert principal
  secondary: '#FF6F00',    // Orange secondaire
  // Changez ces valeurs !
};
```

### Changer le logo

Remplacez ces fichiers dans le dossier `assets/` :
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1024x1024)

## 📊 Tester avec des données

### Script SQL de test

Vous pouvez créer des données de test dans MySQL :

```sql
-- Ajouter des membres de test
INSERT INTO membre (famille_id, nom, prenom, sexe, date_naissance, profession)
VALUES
  (1, 'Diop', 'Amadou', 'M', '1980-01-15', 'Développeur'),
  (1, 'Diop', 'Fatou', 'F', '1985-05-20', 'Médecin'),
  (1, 'Diop', 'Moussa', 'M', '2010-03-10', 'Étudiant');
```

Rafraîchissez l'app (tirez vers le bas) pour voir les données !

## 🚀 Commandes utiles

```bash
# Démarrer avec cache vidé
expo start -c

# Ouvrir sur émulateur Android (si installé)
npm run android

# Ouvrir sur simulateur iOS (Mac uniquement)
npm run ios

# Version web (navigateur)
npm run web
```

## 📞 Besoin d'aide ?

1. **Logs du backend** : Regardez le terminal où `node server.js` est lancé
2. **Logs du frontend** : Regardez le terminal où `npm start` est lancé
3. **Logs de l'app** : Secouez votre téléphone > Show Dev Menu > Debug

## ✅ Checklist de démarrage

- [ ] Backend démarré (`node server.js`)
- [ ] MySQL en cours d'exécution
- [ ] Base de données créée
- [ ] IP configurée dans `config.js`
- [ ] Dépendances installées (`npm install`)
- [ ] Expo démarré (`npm start`)
- [ ] Expo Go installé sur le téléphone
- [ ] Téléphone et PC sur le même WiFi
- [ ] QR code scanné
- [ ] Application chargée avec succès

## 🎉 C'est tout !

Vous êtes prêt à utiliser Senaskane Mobile !

Pour plus de détails, consultez [README.md](README.md)
