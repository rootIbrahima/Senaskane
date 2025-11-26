# Architecture de l'Application Senaskane Mobile

## 📐 Vue d'ensemble

L'application Senaskane Mobile est construite avec React Native et Expo, suivant une architecture modulaire et scalable.

```
┌─────────────────────────────────────────┐
│           App.js (Entry Point)          │
│  ┌────────────────────────────────────┐ │
│  │       AuthProvider (Context)       │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │   NavigationContainer        │  │ │
│  │  │  ┌────────────────────────┐  │  │ │
│  │  │  │  AuthNavigator  ou     │  │  │ │
│  │  │  │  AppNavigator          │  │  │ │
│  │  │  └────────────────────────┘  │  │ │
│  │  └──────────────────────────────┘  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🗂️ Structure des dossiers

```
src/
├── api/              # Couche de communication avec le backend
├── components/       # Composants réutilisables
├── contexts/         # Gestion d'état globale (Context API)
├── navigation/       # Configuration de la navigation
├── screens/          # Écrans de l'application
└── utils/            # Utilitaires et configuration
```

## 🔌 Couche API (src/api/)

### axios.js
Configuration globale d'Axios avec :
- Base URL de l'API
- Intercepteurs pour les tokens JWT
- Gestion automatique des erreurs 401

```javascript
// Exemple d'utilisation
import api from './axios';
const response = await api.get('/membre');
```

### Services API
Chaque module a son propre service :
- `authApi.js` - Authentification
- `familleApi.js` - Gestion des familles
- `membreApi.js` - Gestion des membres
- etc.

**Pattern utilisé :**
```javascript
export const membreApi = {
  getMembres: async () => {
    const response = await api.get('/membre');
    return response.data;
  },
  // autres méthodes...
};
```

## 🎨 Composants (src/components/)

### Composants de base
- **Button** : Bouton personnalisé avec variants (primary, secondary, outline)
- **Input** : Champ de saisie avec label, validation et messages d'erreur
- **Card** : Conteneur avec style card Material Design
- **Loading** : Indicateur de chargement
- **ErrorMessage** : Affichage des messages d'erreur

### Utilisation
```javascript
import { Button, Input, Card } from '../components';

<Input
  label="Nom"
  value={nom}
  onChangeText={setNom}
  error={errors.nom}
/>
```

## 🌍 Context API (src/contexts/)

### AuthContext
Gestion globale de l'authentification :

**État :**
- `user` : Utilisateur connecté
- `isAuthenticated` : Statut de connexion
- `loading` : Chargement initial

**Méthodes :**
- `login(username, password)` : Connexion
- `register(data)` : Inscription
- `logout()` : Déconnexion
- `updateUser(user)` : Mise à jour du profil

**Utilisation :**
```javascript
import { useAuth } from '../contexts/AuthContext';

const { user, login, logout } = useAuth();
```

## 🧭 Navigation (src/navigation/)

### Structure de navigation

```
AuthNavigator (Non connecté)
├── Login
└── Register

AppNavigator (Connecté)
└── TabNavigator
    ├── Home (Tab)
    ├── Membres (Tab)
    ├── Ceremonies (Tab)
    ├── Recherche (Tab)
    └── Profile (Tab)
├── Musee (Stack)
├── Actualites (Stack)
├── Cotisations (Stack)
└── ArbreGenealogique (Stack)
```

### AuthNavigator
Navigation pour les utilisateurs non authentifiés
- Écrans : Login, Register
- Pas de header

### AppNavigator
Navigation principale avec :
- **Bottom Tabs** : 5 onglets principaux
- **Stack Navigator** : Écrans secondaires

## 📱 Écrans (src/screens/)

### Catégories d'écrans

#### Authentification
- `LoginScreen` : Connexion
- `RegisterScreen` : Inscription

#### Écrans principaux (Tabs)
- `HomeScreen` : Accueil avec statistiques
- `MembresScreen` : Liste des membres
- `CeremoniesScreen` : Liste des cérémonies
- `RechercheScreen` : Recherche
- `ProfileScreen` : Profil utilisateur

#### Écrans secondaires (Stack)
- `MuseeScreen` : Musée familial
- `ActualitesScreen` : Actualités
- `CotisationsScreen` : Cotisations
- `ArbreGenealogiqueScreen` : Arbre généalogique

### Pattern des écrans

Chaque écran suit ce pattern :

```javascript
export const MonEcran = ({ navigation }) => {
  // 1. Hooks
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Effects
  useEffect(() => {
    loadData();
  }, []);

  // 3. Fonctions
  const loadData = async () => {
    try {
      const result = await api.getData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Render
  if (loading) return <Loading />;

  return (
    <View>
      {/* Contenu */}
    </View>
  );
};
```

## 🎨 Theming (src/utils/config.js)

### Système de couleurs
```javascript
export const COLORS = {
  primary: '#2E7D32',       // Vert principal
  primaryDark: '#1B5E20',   // Vert foncé
  primaryLight: '#4CAF50',  // Vert clair
  secondary: '#FF6F00',     // Orange
  background: '#F5F5F5',    // Fond gris clair
  white: '#FFFFFF',
  text: '#212121',          // Texte principal
  textSecondary: '#757575', // Texte secondaire
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
};
```

### Espacement
```javascript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

### Tailles de police
```javascript
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};
```

## 🔐 Gestion de l'authentification

### Flow d'authentification

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  authApi    │────▶│   Backend    │
│  .login()   │     │   /api/auth  │
└──────┬──────┘     └──────────────┘
       │
       ▼
┌─────────────┐
│ AsyncStorage│
│ - token     │
│ - user      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AuthContext │
│ setUser()   │
│ setAuth()   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Navigation  │
│ AppNavigator│
└─────────────┘
```

### Stockage sécurisé
- Token JWT stocké dans AsyncStorage
- Ajouté automatiquement à chaque requête via intercepteur Axios
- Supprimé lors de la déconnexion

### Gestion des erreurs 401
```javascript
// Dans axios.js
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré : déconnexion automatique
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);
```

## 📡 Communication avec le Backend

### Headers automatiques
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
```

### Gestion des erreurs
```javascript
try {
  const data = await membreApi.getMembres();
  setMembres(data);
} catch (error) {
  if (error.response) {
    // Erreur du serveur (4xx, 5xx)
    Alert.alert('Erreur', error.response.data.error);
  } else if (error.request) {
    // Pas de réponse du serveur
    Alert.alert('Erreur', 'Serveur inaccessible');
  } else {
    // Autre erreur
    Alert.alert('Erreur', error.message);
  }
}
```

## 🖼️ Gestion des images

### Upload d'images
```javascript
const formData = new FormData();
formData.append('photo', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'photo.jpg',
});

await membreApi.uploadPhoto(membreId, formData);
```

### Affichage d'images
```javascript
<Image
  source={{
    uri: `${API_URL.replace('/api', '')}/uploads/photos/${photo}`
  }}
  style={styles.photo}
/>
```

## 🔄 Gestion de l'état

### État local (useState)
Pour l'état spécifique à un composant/écran

### Context API (AuthContext)
Pour l'état global partagé :
- Utilisateur connecté
- Token d'authentification

### Pas de Redux
L'application n'utilise pas Redux pour rester simple et maintenable.

## 🎯 Bonnes pratiques utilisées

### 1. Séparation des responsabilités
- Services API séparés par domaine
- Composants réutilisables
- Logique métier dans les écrans

### 2. Gestion d'erreurs
- Try/catch dans toutes les requêtes
- Messages d'erreur utilisateur-friendly
- Loading states partout

### 3. Performance
- FlatList pour les grandes listes
- Lazy loading des images
- RefreshControl pour le pull-to-refresh

### 4. UX
- Loading indicators
- Messages d'erreur clairs
- Confirmations pour actions destructives

### 5. Sécurité
- Tokens JWT
- Intercepteurs pour refresh automatique
- Validation côté client et serveur

## 🚀 Extensions possibles

### Features à ajouter
1. **Mode offline** : Utiliser AsyncStorage pour cache local
2. **Notifications push** : Expo Notifications
3. **Photos multiples** : Galerie d'images
4. **Export PDF** : Générer l'arbre en PDF
5. **Partage** : Partager des membres sur WhatsApp
6. **Localisation** : i18n pour multi-langues
7. **Dark mode** : Thème sombre

### Améliorations techniques
1. **TypeScript** : Typage fort
2. **Tests** : Jest + React Testing Library
3. **CI/CD** : GitHub Actions pour build auto
4. **Analytics** : Suivi d'utilisation
5. **Crash reporting** : Sentry

## 📊 Performance

### Optimisations actuelles
- ✅ FlatList avec keyExtractor
- ✅ Images optimisées
- ✅ Lazy loading
- ✅ Cache des requêtes

### Métriques cibles
- Temps de chargement initial : < 3s
- Navigation entre écrans : < 100ms
- Scroll fluide : 60 FPS

---

**Cette architecture permet :**
- ✅ Maintenabilité
- ✅ Scalabilité
- ✅ Testabilité
- ✅ Réutilisabilité
- ✅ Performance
