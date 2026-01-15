# 📢 Guide d'Intégration des Publicités - Baïla Généa

## ✅ Ce qui a été fait

### 1. Composants créés
- **`AdBanner.jsx`** : Composant de bannière publicitaire avec carousel automatique
- **`AdBannerCompact.jsx`** : Composant de publicité compacte pour sidebars

### 2. Configuration
- **`src/config/ads.js`** : Fichier de configuration centralisé des publicités
  - Liste des publicités pour Tigo, Free, Orange, Air Sénégal, Wave, Expresso
  - Configuration des pages où afficher les publicités
  - Paramètres de défilement automatique

### 3. Intégration
- **Page d'accueil (Home.jsx)** : Bannière principale intégrée entre les actions rapides et les fonctionnalités

## 🎯 Prochaines étapes pour vous

### Étape 1: Obtenir les images des sponsors

Contactez chaque sponsor et demandez-leur de fournir:

#### Pour Tigo:
- `tigo-banner.jpg` (1200x400px) - Bannière avec message publicitaire
- `tigo-logo.png` (200x200px) - Logo officiel

#### Pour Free:
- `free-banner.jpg` (1200x400px)
- `free-logo.png` (200x200px)

#### Pour Orange:
- `orange-banner.jpg` (1200x400px)
- `orange-logo.png` (200x200px)

#### Pour Air Sénégal:
- `airsenegal-banner.jpg` (1200x400px)
- `airsenegal-logo.png` (200x200px)

### Étape 2: Placer les images

Copiez toutes les images dans:
```
Senaskane/web-app/public/ads/
```

### Étape 3: Modifier la configuration (optionnel)

Si vous voulez personnaliser les publicités:

1. Ouvrez: `Senaskane/web-app/src/config/ads.js`
2. Modifiez les textes, URLs, ou ajoutez de nouvelles publicités

```javascript
{
  id: 5,
  title: "Votre Nouveau Sponsor",
  description: "Description attractive",
  image: "/ads/nouveau-sponsor-banner.jpg",
  logo: "/ads/nouveau-sponsor-logo.png",
  url: "https://www.sponsor.com",
  sponsor: "Nom du Sponsor"
}
```

### Étape 4: Intégrer sur d'autres pages

Pour ajouter des publicités sur d'autres pages:

**Exemple pour la page Membres:**

```javascript
// Dans Members.jsx
import { AdBanner } from '../components';
import { getAdsForPage } from '../config/ads';

export const Members = () => {
  const { mainBanner, autoPlayInterval } = getAdsForPage('members');

  return (
    <div>
      {/* Contenu existant */}

      {/* Ajouter la bannière */}
      {mainBanner && mainBanner.length > 0 && (
        <div className="my-8">
          <AdBanner ads={mainBanner} autoPlayInterval={autoPlayInterval} />
        </div>
      )}

      {/* Reste du contenu */}
    </div>
  );
};
```

## 🎨 Fonctionnalités du système de publicité

### ✨ Bannière principale (AdBanner)
- ✅ Défilement automatique toutes les 5 secondes
- ✅ Navigation manuelle avec flèches
- ✅ Indicateurs de slides (points en bas)
- ✅ Pause automatique au survol
- ✅ Badge "SPONSORISÉ" visible
- ✅ Bouton "Pourquoi cette pub?" informatif
- ✅ Liens cliquables vers sites sponsors
- ✅ Responsive (s'adapte à tous les écrans)
- ✅ Animations fluides

### 📦 Bannière compacte (AdBannerCompact)
- ✅ Format horizontal compact
- ✅ Logo + texte + lien
- ✅ Parfait pour sidebars
- ✅ Moins intrusif

## 💰 Monétisation suggérée

### Tarifs recommandés:
- **Bannière principale** (pages à fort trafic): 50 000 - 100 000 FCFA/mois
- **Bannière compacte**: 25 000 - 50 000 FCFA/mois
- **Package multiple pages**: 150 000 - 250 000 FCFA/mois

### Offres groupées:
- 3 mois: -10%
- 6 mois: -15%
- 1 an: -20%

## 📊 Pages suggérées pour publicités

### Priorité 1 (fort trafic):
- ✅ **Page d'accueil** - DÉJÀ INTÉGRÉE
- ⬜ **Liste des membres**
- ⬜ **Arbre généalogique**

### Priorité 2:
- ⬜ **Musée familial**
- ⬜ **Détails d'un membre**
- ⬜ **Recherche avancée**

### Priorité 3:
- ⬜ **Cérémonies**
- ⬜ **Informations famille**

## 🔧 Personnalisation avancée

### Changer l'intervalle de défilement:
```javascript
// Dans src/config/ads.js
autoPlayInterval: 7000  // 7 secondes au lieu de 5
```

### Désactiver l'auto-play:
```javascript
<AdBanner ads={mainBanner} autoPlayInterval={0} />
```

### Ajouter tracking/analytics:
Modifiez `handleAdClick` dans `AdBanner.jsx`:
```javascript
const handleAdClick = (ad) => {
  // Ajoutez votre tracking ici
  console.log('Clic sur pub:', ad.sponsor);
  // Google Analytics, etc.

  if (ad.url) {
    window.open(ad.url, '_blank');
  }
};
```

## 📱 Test en local

1. Démarrez le serveur de développement:
```bash
cd Senaskane/web-app
npm start
```

2. Allez sur: `http://localhost:3000`
3. Vérifiez que la bannière publicitaire défile automatiquement

## ⚠️ Notes importantes

- Les images doivent être optimisées (< 500 KB)
- Utilisez des formats web (JPG pour photos, PNG pour logos)
- Testez sur mobile et desktop
- Respectez les ratios recommandés (3:1 pour bannières)

## 🆘 Besoin d'aide?

Si vous rencontrez des problèmes:
1. Vérifiez que les chemins des images sont corrects
2. Vérifiez la console du navigateur (F12) pour les erreurs
3. Assurez-vous que les images existent dans `public/ads/`

## 📈 Prochaines améliorations possibles

- [ ] Système de rotation A/B testing
- [ ] Dashboard admin pour gérer les pubs
- [ ] Statistiques de clics
- [ ] Publicités géolocalisées
- [ ] Publicités ciblées par type d'utilisateur
