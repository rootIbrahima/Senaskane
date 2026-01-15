# Dossier des Publicités

Ce dossier contient toutes les images publicitaires des sponsors.

## Structure recommandée

```
public/ads/
├── tigo-banner.jpg          (1200x400px minimum)
├── tigo-logo.png            (200x200px)
├── free-banner.jpg          (1200x400px minimum)
├── free-logo.png            (200x200px)
├── orange-banner.jpg        (1200x400px minimum)
├── orange-logo.png          (200x200px)
├── airsenegal-banner.jpg    (1200x400px minimum)
├── airsenegal-logo.png      (200x200px)
├── wave-logo.png            (200x200px)
├── expresso-logo.png        (200x200px)
└── photostudio-logo.png     (200x200px)
```

## Dimensions recommandées

### Bannières principales (grandes)
- **Dimensions**: 1200 x 400 pixels minimum
- **Format**: JPG ou PNG
- **Poids**: Maximum 500 KB
- **Ratio**: 3:1 (largeur:hauteur)

### Logos
- **Dimensions**: 200 x 200 pixels
- **Format**: PNG avec fond transparent
- **Poids**: Maximum 100 KB
- **Ratio**: 1:1 (carré)

## Comment ajouter une nouvelle publicité

1. **Ajoutez les images** dans ce dossier `public/ads/`

2. **Modifiez le fichier de configuration** : `src/config/ads.js`

   ```javascript
   {
     id: 5,
     title: "Nom de l'entreprise - Slogan",
     description: "Description courte et attractive",
     image: "/ads/nom-entreprise-banner.jpg",
     logo: "/ads/nom-entreprise-logo.png",
     url: "https://www.site-entreprise.com",
     sponsor: "Nom de l'entreprise"
   }
   ```

3. **Testez** en rafraîchissant la page d'accueil

## Conseils pour de bonnes publicités

- ✅ Images haute qualité et professionnelles
- ✅ Texte lisible et concis
- ✅ Appel à l'action clair
- ✅ Couleurs cohérentes avec la marque
- ✅ Optimisées pour le web (compression)

## Pages avec publicités

- **Page d'accueil** (Home) - Bannière principale
- **Liste des membres** (Members) - Bannière principale
- **Arbre généalogique** (Tree) - Bannière principale
- **Musée familial** (Museum) - Bannière principale
- **Détails membre** (MemberDetail) - Publicité compacte
- **Recherche** (Search) - Publicité compacte
- **Cérémonies** (Ceremonies) - Publicité compacte

## Support

Pour toute question concernant l'intégration des publicités, contactez l'équipe technique.
