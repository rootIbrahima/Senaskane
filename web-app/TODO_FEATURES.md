# TODO - Fonctionnalités à implémenter sur l'application Web

## 📊 Analyse Backend & Mobile vs Web

### ✅ Fonctionnalités déjà implémentées sur le web
1. ✅ Arbre généalogique (visualisation hiérarchique avec expansion/collapse)
2. ✅ Gestion des membres (CRUD complet)
3. ✅ Musée familial (liste et ajout d'objets)
4. ✅ Gestion des cérémonies
5. ✅ Cotisations de base
6. ✅ Recherche avancée (multi-critères, lien de parenté, descendants/ascendants)
7. ✅ Informations de la famille + statistiques
8. ✅ Détails des membres
9. ✅ Dashboard
10. ✅ Authentification (login/register)

---

## ❌ Fonctionnalités à implémenter

### **Phase 1 - Essentiel** (Priorité Haute)

#### 1. Visualisation du lien de parenté avec organigramme
**Statut**: ✅ Terminé
**Priorité**: 🔴 Haute
**Localisation**: `web-app/src/pages/AdvancedSearch.jsx` + `web-app/src/components/RelationshipTree.jsx`
**Description**:
- ✅ Composant RelationshipTree créé avec organigramme visuel
- ✅ Ancêtre commun en haut avec badge "🎯 Ancêtre" et style spécial
- ✅ Deux branches descendantes pour les deux membres
- ✅ Lignes verticales et horizontales avec gradient de couleur
- ✅ Cartes de membre colorées par sexe (bleu pour hommes, rose pour femmes)
- ✅ Scroll horizontal automatique
- ✅ Selects pour choisir les membres (pas besoin de connaître les IDs)
- ✅ Affichage amélioré avec résumé du lien et détails

**Backend endpoint**: `/api/recherche/lien-parente/:membreId1/:membreId2`

---

#### 2. Amélioration de la gestion financière - Recettes
**Statut**: ❌ À faire
**Priorité**: 🔴 Haute
**Localisation**: `web-app/src/pages/Cotisations.jsx`
**Description**:
- Actuellement: Seulement cotisations
- Mobile: Système complet de recettes avec types
- À implémenter:
  - Ajouter onglet "Recettes" séparé de "Cotisations"
  - Types de recettes: cotisation, don, autre
  - Formulaire d'ajout de recette avec:
    - Type de recette (select)
    - Montant
    - Contributeur/Nom
    - Description
    - Date
  - Liste des recettes avec détails
  - Suppression de recette (admin uniquement)

**Backend endpoints**:
- `POST /api/ceremonie/:id/recettes`
- `GET /api/ceremonie/:id/recettes`
- `DELETE /api/ceremonie/:id/recettes/:recetteId`

---

#### 3. Gestion des dépenses par rubrique
**Statut**: ⚠️ Partiel (basique existe)
**Priorité**: 🔴 Haute
**Localisation**: `web-app/src/pages/Cotisations.jsx`
**Description**:
- Actuellement: Dépenses simples avec libellé et montant
- Mobile: Dépenses avec rubriques prédéfinies
- À implémenter:
  - Ajouter select de rubrique au formulaire dépense:
    - Bache
    - Chaises
    - Sonorisation
    - Repas
    - Honoraires
    - Transport
    - Habillement
    - Autre
  - Afficher la rubrique dans la liste des dépenses
  - Filtrer par rubrique

**Backend**: Déjà supporté via champ `rubrique`

---

#### 4. Tableau de bord financier avec graphiques
**Statut**: ❌ À faire
**Priorité**: 🔴 Haute
**Localisation**: Nouvelle page ou amélioration de `Cotisations.jsx`
**Description**:
- Mobile: Interface avec graphiques visuels
- À implémenter:
  - Graphiques de type:
    - Bilan global (recettes vs dépenses)
    - Camembert: Répartition recettes par type
    - Camembert: Répartition dépenses par rubrique
    - Graphique en barres: Évolution mensuelle
  - Utiliser une bibliothèque: recharts ou chart.js
  - Indicateurs clés:
    - Total recettes
    - Total dépenses
    - Solde (avec couleur selon positif/négatif)
    - Taux de collecte des cotisations

**Backend endpoints**: Existants (bilan, recettes, dépenses)

---

#### 5. Page Profil utilisateur
**Statut**: ❌ À faire
**Priorité**: 🔴 Haute
**Localisation**: Nouvelle page `web-app/src/pages/Profile.jsx`
**Description**:
- Mobile: Page profil complète
- À implémenter:
  - Affichage des informations de l'utilisateur
  - Modification du mot de passe
  - Modification des informations personnelles
  - Photo de profil (upload)
  - Affichage du rôle (admin, membre, trésorier)
  - Déconnexion

**Backend endpoints**:
- `GET /api/auth/me`
- `PUT /api/auth/update-profile`
- `PUT /api/auth/change-password`

---

### **Phase 2 - Important** (Priorité Moyenne)

#### 6. Page Statistiques de Recherche
**Statut**: ❌ À faire
**Priorité**: 🟡 Moyenne
**Localisation**: `web-app/src/pages/AdvancedSearch.jsx` ou nouvelle page
**Description**:
- Backend: Endpoint `/api/recherche/statistiques` existe
- À implémenter:
  - Top 10 lieux de naissance (graphique + liste)
  - Top 10 lieux de résidence (graphique + liste)
  - Top 10 professions (graphique + liste)
  - Visualisation avec graphiques en barres

**Backend endpoint**: `/api/recherche/statistiques`

---

#### 7. Recherche rapide globale
**Statut**: ❌ À faire
**Priorité**: 🟡 Moyenne
**Localisation**: Header/Navbar de l'application
**Description**:
- Barre de recherche dans le header (toujours accessible)
- Recherche instantanée avec debounce
- Autocomplete avec suggestions
- Recherche dans:
  - Membres (nom, prénom, numéro)
  - Cérémonies (titre)
  - Objets du musée (nom)
- Résultats groupés par catégorie
- Navigation rapide vers les détails

**Backend endpoints**:
- `/api/membre/search?q=...`
- `/api/ceremonie?search=...`
- `/api/musee?search=...`

---

#### 8. Mode sombre (Dark mode)
**Statut**: ❌ À faire
**Priorité**: 🟡 Moyenne
**Localisation**: Configuration globale + tous les composants
**Description**:
- Toggle dans le header ou paramètres
- Utiliser CSS variables ou Tailwind dark mode
- Sauvegarder la préférence dans localStorage
- Appliquer à toutes les pages et composants
- Respecter la préférence système (prefers-color-scheme)

**Technique**: Tailwind `dark:` classes ou CSS variables

---

#### 9. Optimisation responsive mobile
**Statut**: ⚠️ Partiel
**Priorité**: 🟡 Moyenne
**Localisation**: Toutes les pages
**Description**:
- Vérifier et optimiser toutes les pages pour mobile
- Points à vérifier:
  - Arbre généalogique: Touch gestures, zoom
  - Tableaux: Scroll horizontal ou cartes empilées
  - Modals: Full screen sur mobile
  - Navigation: Menu burger
  - Formulaires: Espacement adapté
  - Images: Tailles responsives

**Technique**: Tailwind responsive classes (sm:, md:, lg:)

---

### **Phase 3 - Nice to have** (Priorité Basse)

#### 10. Timeline familiale
**Statut**: ❌ À faire
**Priorité**: 🟢 Basse
**Localisation**: Nouvelle page `web-app/src/pages/Timeline.jsx`
**Description**:
- Chronologie des événements importants
- Types d'événements:
  - Naissances
  - Mariages
  - Décès
  - Cérémonies
  - Ajout au musée
- Affichage chronologique avec ligne du temps
- Filtres par type d'événement
- Vue par année/décennie

**Backend**: Agrégation des données existantes

---

#### 11. Calendrier des anniversaires
**Statut**: ❌ À faire
**Priorité**: 🟢 Basse
**Localisation**: Nouvelle page `web-app/src/pages/Calendar.jsx`
**Description**:
- Vue calendrier mensuelle
- Anniversaires des membres
- Dates des cérémonies
- Événements familiaux
- Navigation entre mois/années
- Liste des anniversaires du mois
- Mise en évidence du jour actuel

**Bibliothèque**: react-calendar ou fullcalendar

---

#### 12. Système de notifications
**Statut**: ❌ À faire
**Priorité**: 🟢 Basse
**Localisation**: Header + Backend
**Description**:
- Icône de notification dans le header
- Badge avec nombre de notifications non lues
- Types de notifications:
  - Nouvelle cérémonie
  - Cotisation en attente (pour admin/trésorier)
  - Anniversaire proche
  - Nouvel objet au musée
- Marquer comme lu
- Historique des notifications

**Backend**: Nouvelle table + endpoints notifications

---

#### 13. Amélioration galerie photos
**Statut**: ⚠️ Basique existe
**Priorité**: 🟢 Basse
**Localisation**: `web-app/src/pages/MemberDetail.jsx` et `Members.jsx`
**Description**:
- Vue galerie pour les photos
- Zoom sur clic
- Lightbox pour navigation entre photos
- Upload multiple de photos
- Suppression de photos
- Photo de couverture vs photos supplémentaires
- Rotation d'image

**Bibliothèque**: react-image-gallery ou lightbox2

---

#### 14. Amélioration détail des membres avec onglets
**Statut**: ⚠️ Basique existe
**Priorité**: 🟢 Basse
**Localisation**: `web-app/src/pages/MemberDetail.jsx`
**Description**:
- Organisation en onglets:
  - Informations générales
  - Famille (parents, enfants, fratrie, conjoint)
  - Photos
  - Événements liés (cérémonies participées)
  - Historique (modifications)
- Amélioration de la présentation visuelle
- Actions rapides (modifier, supprimer, partager)

---

#### 15. Amélioration page Musée
**Statut**: ⚠️ Basique existe
**Priorité**: 🟢 Basse
**Localisation**: `web-app/src/pages/Museum.jsx`
**Description**:
- Filtres avancés:
  - Par date d'acquisition
  - Par valeur estimée
  - Par état de conservation
  - Par catégorie (à ajouter)
- Barre de recherche
- Tri (date, valeur, nom)
- Vue grille vs vue liste
- Photos multiples par objet
- Historique de l'objet

---

#### 16. Fonctionnalité de partage
**Statut**: ❌ À faire
**Priorité**: 🟢 Basse
**Localisation**: Divers composants
**Description**:
- Générer des liens partageables pour:
  - Profil d'un membre
  - Cérémonie
  - Objet du musée
- Accès temporaire ou permanent
- QR code pour partage facile
- Copier le lien dans le presse-papier

**Backend**: Génération de tokens de partage

---

#### 17. Impression d'arbre généalogique
**Statut**: ❌ À faire
**Priorité**: 🟢 Basse
**Localisation**: `web-app/src/pages/FamilyTree.jsx`
**Description**:
- Bouton d'export/impression
- Formats:
  - PDF (via jsPDF)
  - PNG/JPG (via html2canvas)
- Options:
  - Tout l'arbre ou branche spécifique
  - Avec/sans photos
  - Orientation portrait/paysage
  - Taille de papier (A4, A3, etc.)

**Bibliothèques**: jsPDF + html2canvas

---

#### 18. Page À propos
**Statut**: ❌ À faire
**Priorité**: 🟢 Basse
**Localisation**: Nouvelle page `web-app/src/pages/About.jsx`
**Description**:
- Informations sur l'application
- Version de l'application
- Technologies utilisées
- Contact/Support
- Conditions d'utilisation
- Politique de confidentialité
- Crédits

---

#### 19. Amélioration des exports PDF
**Statut**: ⚠️ Basique existe
**Priorité**: 🟢 Basse
**Localisation**: `web-app/src/pages/Cotisations.jsx`
**Description**:
- Prévisualisation avant export
- Options de personnalisation:
  - Logo de la famille
  - En-tête personnalisé
  - Filtres de données
  - Format (A4, Letter)
- Export multiple (tous les PDFs en zip)

---

#### 20. Dashboard amélioré avec graphiques
**Statut**: ⚠️ Basique existe
**Priorité**: 🟢 Basse
**Localisation**: `web-app/src/pages/Home.jsx`
**Description**:
- Ajout de graphiques:
  - Pyramide des âges (hommes/femmes)
  - Répartition géographique (carte)
  - Timeline des cérémonies
  - Croissance de la famille (membres par année)
  - Top professions
- Widgets cliquables pour navigation
- Statistiques en temps réel

**Bibliothèque**: recharts ou chart.js

---

## 📋 Résumé par priorité

### 🔴 Priorité Haute (Phase 1)
1. Visualisation du lien de parenté avec organigramme
2. Amélioration gestion financière - Recettes
3. Gestion des dépenses par rubrique
4. Tableau de bord financier avec graphiques
5. Page Profil utilisateur

### 🟡 Priorité Moyenne (Phase 2)
6. Page Statistiques de Recherche
7. Recherche rapide globale
8. Mode sombre
9. Optimisation responsive mobile

### 🟢 Priorité Basse (Phase 3)
10. Timeline familiale
11. Calendrier des anniversaires
12. Système de notifications
13. Amélioration galerie photos
14. Amélioration détail des membres avec onglets
15. Amélioration page Musée
16. Fonctionnalité de partage
17. Impression d'arbre généalogique
18. Page À propos
19. Amélioration des exports PDF
20. Dashboard amélioré avec graphiques

---

## 🛠️ Bibliothèques recommandées

- **Graphiques**: recharts ou chart.js
- **Calendrier**: react-calendar ou fullcalendar
- **Galerie photos**: react-image-gallery ou lightbox2
- **Export PDF**: jsPDF + html2canvas
- **Dates**: date-fns ou dayjs
- **Notifications**: react-toastify
- **Icons**: déjà utilisé (probablement heroicons ou lucide-react)

---

## 📝 Notes importantes

- Toutes les fonctionnalités doivent respecter les permissions (admin, membre, trésorier)
- Maintenir la cohérence visuelle avec le design existant
- Optimiser les performances (lazy loading, pagination)
- Tester sur différents navigateurs
- Assurer l'accessibilité (WCAG)
- Documenter les nouvelles fonctionnalités

---

**Dernière mise à jour**: 2026-01-08
