# Senaskane Mobile App

Application mobile React Native pour la gestion des arbres généalogiques familiaux.

## 📱 Fonctionnalités

- 🔐 Authentification (Login/Register)
- 👥 Gestion des membres de la famille
- 🌳 Arbre généalogique interactif
- 📅 Gestion des cérémonies (mariages, baptêmes, etc.)
- 🏛️ Musée familial (objets et souvenirs)
- 📰 Actualités familiales (bande passante)
- 💰 Gestion des cotisations
- 🔍 Recherche de membres
- 👤 Profil utilisateur

## 🚀 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app sur votre téléphone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Étapes d'installation

1. **Installer les dépendances**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Configuration de l'API**

   Modifiez le fichier `src/utils/config.js` et changez l'URL de l'API :
   ```javascript
   export const API_URL = 'http://VOTRE_IP_LOCALE:3000/api';
   ```

   Pour trouver votre IP locale :
   - Windows : `ipconfig` dans le cmd
   - Mac/Linux : `ifconfig` dans le terminal

   Exemple : `http://192.168.1.100:3000/api`

3. **Assurez-vous que le backend est démarré**
   ```bash
   cd ../backend
   node server.js
   ```

## 🎯 Lancement de l'application

1. **Démarrer Expo**
   ```bash
   npm start
   ```

2. **Scanner le QR code**
   - Ouvrez l'app Expo Go sur votre téléphone
   - Scannez le QR code affiché dans le terminal ou le navigateur
   - L'application se chargera automatiquement

## 📱 Utilisation avec Expo Go

### Sur Android
1. Ouvrez Expo Go
2. Appuyez sur "Scan QR Code"
3. Scannez le QR code affiché

### Sur iOS
1. Ouvrez l'app Appareil Photo
2. Scannez le QR code
3. Appuyez sur la notification Expo Go

## 🔧 Commandes disponibles

```bash
npm start          # Démarrer Expo
npm run android    # Ouvrir sur émulateur Android
npm run ios        # Ouvrir sur simulateur iOS
npm run web        # Ouvrir dans le navigateur
```

## 📂 Structure du projet

```
mobile-app/
├── App.js                      # Point d'entrée principal
├── app.json                    # Configuration Expo
├── package.json                # Dépendances
├── src/
│   ├── api/                    # Services API
│   │   ├── axios.js
│   │   ├── authApi.js
│   │   ├── familleApi.js
│   │   ├── membreApi.js
│   │   ├── ceremonieApi.js
│   │   ├── museeApi.js
│   │   ├── bandePassanteApi.js
│   │   ├── cotisationApi.js
│   │   └── rechercheApi.js
│   ├── components/             # Composants réutilisables
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Card.js
│   │   ├── Loading.js
│   │   └── ErrorMessage.js
│   ├── contexts/               # Contextes React
│   │   └── AuthContext.js
│   ├── navigation/             # Navigation
│   │   ├── AppNavigator.js
│   │   └── AuthNavigator.js
│   ├── screens/                # Écrans de l'application
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── MembresScreen.js
│   │   ├── ArbreGenealogiqueScreen.js
│   │   ├── CeremoniesScreen.js
│   │   ├── MuseeScreen.js
│   │   ├── ActualitesScreen.js
│   │   ├── CotisationsScreen.js
│   │   ├── RechercheScreen.js
│   │   └── ProfileScreen.js
│   └── utils/                  # Utilitaires
│       └── config.js           # Configuration (couleurs, API, etc.)
```

## 🎨 Personnalisation

### Couleurs
Modifiez les couleurs dans `src/utils/config.js` :
```javascript
export const COLORS = {
  primary: '#2E7D32',
  secondary: '#FF6F00',
  // ...
};
```

### Logo et Splash Screen
- Logo : Remplacez `assets/icon.png`
- Splash Screen : Remplacez `assets/splash.png`

## 🔐 Authentification

L'application utilise JWT pour l'authentification. Les tokens sont stockés localement avec AsyncStorage.

### Connexion
- Identifiant et mot de passe requis
- Le token est automatiquement ajouté à toutes les requêtes API

### Inscription
- Créez une nouvelle famille avec un administrateur
- Les informations minimales requises :
  - Nom de la famille
  - Identifiant de connexion
  - Mot de passe (min 6 caractères)
  - Nom et prénom

## 📡 API Backend

L'application communique avec le backend Express.js via les endpoints suivants :

- `/api/auth` - Authentification
- `/api/famille` - Gestion des familles
- `/api/membre` - Gestion des membres
- `/api/ceremonie` - Gestion des cérémonies
- `/api/musee` - Musée familial
- `/api/bande-passante` - Actualités
- `/api/cotisation` - Cotisations
- `/api/recherche` - Recherche

## 🐛 Dépannage

### L'application ne se connecte pas au backend

1. Vérifiez que le backend est démarré
2. Vérifiez que votre téléphone et votre ordinateur sont sur le même réseau WiFi
3. Vérifiez l'URL de l'API dans `src/utils/config.js`
4. Désactivez temporairement le pare-feu si nécessaire

### Erreur "Network request failed"

- Assurez-vous que l'URL de l'API est correcte
- Vérifiez que le backend est accessible depuis votre téléphone
- Testez l'URL dans un navigateur : `http://VOTRE_IP:3000/health`

### L'application ne se charge pas

```bash
# Nettoyer le cache
expo start -c

# Réinstaller les dépendances
rm -rf node_modules
npm install
```

## 📦 Build de production

### Android (APK)
```bash
expo build:android
```

### iOS (IPA)
```bash
expo build:ios
```

Note : Un compte Expo est requis pour les builds de production.

## 🔄 Mises à jour

Pour mettre à jour les dépendances :
```bash
npm update
```

Pour mettre à jour Expo :
```bash
expo upgrade
```

## �� Rôles utilisateurs

### Administrateur
- Tous les droits de lecture et d'écriture
- Ajout/modification/suppression de membres
- Gestion des cérémonies
- Publication d'actualités
- Gestion des cotisations

### Membre
- Lecture seule sur toutes les sections
- Consultation de l'arbre généalogique
- Recherche de membres
- Consultation des actualités

## 📝 Notes importantes

1. **Sécurité** : Ne commitez jamais vos tokens ou mots de passe
2. **Performance** : Les images sont optimisées automatiquement
3. **Offline** : L'authentification persiste en mode hors ligne
4. **Données** : Les données sont synchronisées à chaque rafraîchissement

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la documentation Expo : https://docs.expo.dev/
2. Consultez la documentation React Native : https://reactnative.dev/
3. Vérifiez les logs dans le terminal Expo

## 📄 Licence

Ce projet est développé pour la gestion des arbres généalogiques familiaux.

---

**Version** : 1.0.0
**Développé avec** : React Native, Expo, React Navigation
