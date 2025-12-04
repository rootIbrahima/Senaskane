# Plan d'implémentation - Fonctionnalités de recherche et numérotation hiérarchique

## État actuel du projet

### Backend - Routes API disponibles
✅ **Recherche par profession** : `GET /api/membre/recherche/metier/:metier`
✅ **Recherche par lieu** : `GET /api/membre/recherche/lieu/:lieu`
✅ **Lien de parenté** : `POST /api/membre/recherche/lien-parente` (body: {membreId1, membreId2})
✅ **Modèle Membre** : Méthodes `rechercherParMetier()`, `rechercherParLieu()`, `trouverLienParente()` déjà implémentées

### Frontend - Ce qui existe
✅ **RechercheScreen.js** : Écran de recherche basique (recherche globale par nom seulement)
✅ **rechercheApi.js** : API client basique (n'utilise pas les endpoints spécifiques)

### Système de numérotation actuel
❌ **Format actuel** : `FAM{familleId}-MEM{compteur}` (ex: FAM2-MEM001, FAM2-MEM002)
❌ **Format demandé** : Numérotation hiérarchique (ex: parent 002 → enfants 002.001, 002.002)

---

## Fonctionnalités demandées

### 1. Recherche par profession et lieu de résidence
**Objectif** : Permettre aux utilisateurs de filtrer les membres par profession ET/OU lieu de résidence

**Backend** : ✅ Déjà implémenté
**Frontend** : ❌ À créer

### 2. Recherche de lien de parenté entre 2 personnes
**Objectif** : Trouver le lien de parenté entre 2 membres (ex: frère, cousin, oncle, etc.)

**Backend** : ✅ Déjà implémenté avec algorithme récursif CTE
**Frontend** : ❌ À créer

### 3. Numérotation hiérarchique des membres
**Objectif** : Si un parent a le numéro 002, ses enfants doivent avoir 002.001, 002.002, etc.

**Backend** : ❌ À implémenter complètement
**Frontend** : ✅ Aucun changement nécessaire (automatique)

---

## Questions à clarifier avec l'utilisateur

### Q1: Numérotation hiérarchique - Migration des données existantes
**Question** : Voulez-vous recalculer les numéros pour TOUS les membres existants, ou seulement appliquer le nouveau système aux nouveaux membres ?

**Options** :
- **Option A** : Renuméroter tous les membres existants selon la hiérarchie
  - ✅ Cohérence totale
  - ❌ Les anciens numéros seront perdus
  - ⚠️ Nécessite une migration de données

- **Option B** : Garder les anciens numéros, nouveau système pour les nouveaux membres
  - ✅ Pas de perte de données
  - ❌ Incohérence dans la numérotation

**Recommandation** : Option A (renumérotation complète) pour cohérence

### Q2: Format des numéros racines (membres sans parents)
**Question** : Les membres sans parents (racines de l'arbre) auront quel format ?

**Options** :
- **Option A** : Simple compteur (001, 002, 003, ...)
- **Option B** : Garder le format actuel FAM-MEM pour les racines, hiérarchique pour les descendants
- **Option C** : Format personnalisé (ex: R001, R002 pour "Racine")

**Recommandation** : Option A (simple: 001, 002, 003)

### Q3: Numérotation basée sur quel parent ?
**Question** : Si un enfant a un père ET une mère, le numéro est basé sur quel parent ?

**Options** :
- **Option A** : Toujours le père (convention patrilinéaire)
- **Option B** : Toujours la mère (convention matrilinéaire)
- **Option C** : Le parent qui a le numéro le plus petit
- **Option D** : Laisser l'admin choisir lors de l'ajout

**Recommandation** : Option A (père) car convention la plus courante

### Q4: Interface de recherche de lien de parenté
**Question** : Comment voulez-vous afficher la recherche de lien de parenté ?

**Options** :
- **Option A** : Écran dédié avec sélection de 2 membres
- **Option B** : Dans le détail d'un membre, bouton "Voir lien avec..."
- **Option C** : Les deux (écran dédié + raccourci dans détail)

**Recommandation** : Option C (les deux options)

---

## Architecture proposée

### Phase 1 : Amélioration de l'interface de recherche

#### Fichiers à modifier/créer :

**1. Backend** : Aucun changement (déjà prêt)

**2. Frontend - API Client**
- **Fichier** : `mobile-app/src/api/membreApi.js`
- **Ajouts** :
  ```javascript
  rechercherParProfession: async (profession) => {
    const response = await api.get(`/membre/recherche/metier/${encodeURIComponent(profession)}`);
    return response.data;
  },

  rechercherParLieu: async (lieu) => {
    const response = await api.get(`/membre/recherche/lieu/${encodeURIComponent(lieu)}`);
    return response.data;
  },

  trouverLienParente: async (membreId1, membreId2) => {
    const response = await api.post('/membre/recherche/lien-parente', {
      membreId1,
      membreId2
    });
    return response.data;
  }
  ```

**3. Frontend - Écran de recherche amélioré**
- **Fichier** : `mobile-app/src/screens/RechercheScreen.js`
- **Modifications** :
  - Ajouter des onglets : "Par nom" | "Par profession" | "Par lieu"
  - Ajouter des champs de filtre spécifiques
  - Afficher les résultats avec plus de détails

**4. Frontend - Écran de lien de parenté**
- **Nouveau fichier** : `mobile-app/src/screens/LienParenteScreen.js`
- **Contenu** :
  - Sélecteur de 2 membres (autocomplete ou liste)
  - Bouton "Trouver le lien"
  - Affichage du résultat : ancêtre commun, degré, description (ex: "Cousin")
  - Visualisation graphique du chemin (optionnel)

**5. Frontend - Bouton dans détail membre**
- **Fichier** : `mobile-app/src/screens/MembreDetailScreen.js`
- **Ajout** :
  - Bouton "Voir lien de parenté avec..."
  - Ouvre LienParenteScreen avec le membre actuel pré-sélectionné

### Phase 2 : Système de numérotation hiérarchique

#### Fichiers à modifier :

**1. Backend - Modèle Membre**
- **Fichier** : `backend/models/Membre.js`
- **Méthode à modifier** : `genererNumeroIdentification(familleId, pereId = null, mereId = null)`

**Algorithme proposé** :
```javascript
static async genererNumeroIdentification(familleId, pereId = null, mereId = null) {
  // 1. Déterminer le parent de référence (père prioritaire, sinon mère)
  const parentId = pereId || mereId;

  // 2. Si pas de parent = membre racine
  if (!parentId) {
    // Compter les racines existantes (membres sans parents)
    const [racines] = await db.execute(`
      SELECT COUNT(DISTINCT m.id) as total
      FROM membre m
      LEFT JOIN lien_parental lp ON m.id = lp.enfant_id
      WHERE m.famille_id = ? AND lp.id IS NULL
    `, [familleId]);

    const compteur = racines[0].total + 1;
    return String(compteur).padStart(3, '0'); // 001, 002, 003, ...
  }

  // 3. Si a un parent = numéro hiérarchique
  // Récupérer le numéro du parent
  const [parent] = await db.execute(
    'SELECT numero_identification FROM membre WHERE id = ?',
    [parentId]
  );

  const numeroParent = parent[0].numero_identification;

  // Compter les enfants existants de ce parent
  const [enfants] = await db.execute(`
    SELECT COUNT(*) as total
    FROM lien_parental
    WHERE parent_id = ?
  `, [parentId]);

  const compteurEnfant = enfants[0].total + 1;

  // Format: {numeroParent}.{compteur}
  return `${numeroParent}.${String(compteurEnfant).padStart(3, '0')}`;
}
```

**2. Backend - Route d'ajout de membre**
- **Fichier** : `backend/routes/membre.js`
- **Modification** : Passer `pereId` et `mereId` à `genererNumeroIdentification()`

**Ligne ~49 actuelle** :
```javascript
const numeroIdentification = await this.genererNumeroIdentification(familleId);
```

**Nouvelle ligne** :
```javascript
const numeroIdentification = await Membre.genererNumeroIdentification(
  familleId,
  req.body.pereId,
  req.body.mereId
);
```

**3. Migration des données (si Option A choisie)**
- **Nouveau fichier** : `backend/scripts/renuméroter-membres.js`
- **Fonction** : Parcourir tous les membres de chaque famille et recalculer les numéros

**Algorithme** :
1. Pour chaque famille :
   - Trouver les membres racines (sans parents)
   - Les numéroter 001, 002, 003, ...
   - Pour chaque racine, parcourir récursivement leurs descendants
   - Numéroter chaque niveau : parent.001, parent.002, etc.

---

## Plan d'exécution (ordre des tâches)

### Étape 1 : Clarification avec l'utilisateur
- [ ] Poser les 4 questions ci-dessus
- [ ] Attendre les réponses
- [ ] Ajuster le plan selon les réponses

### Étape 2 : Phase 1 - Recherche avancée (Backend déjà prêt)

#### 2.1 Frontend - API Client
- [ ] Ajouter `rechercherParProfession()` à `membreApi.js`
- [ ] Ajouter `rechercherParLieu()` à `membreApi.js`
- [ ] Ajouter `trouverLienParente()` à `membreApi.js`

#### 2.2 Frontend - Écran de recherche amélioré
- [ ] Modifier `RechercheScreen.js` : ajouter onglets (Nom, Profession, Lieu)
- [ ] Ajouter champ de recherche par profession
- [ ] Ajouter champ de recherche par lieu
- [ ] Améliorer l'affichage des résultats (montrer profession + lieu)

#### 2.3 Frontend - Écran lien de parenté
- [ ] Créer `LienParenteScreen.js`
- [ ] Implémenter sélection de 2 membres
- [ ] Afficher le résultat du lien (ancêtre commun, degré, description)
- [ ] Ajouter au navigateur

#### 2.4 Frontend - Intégration dans détail membre
- [ ] Modifier `MembreDetailScreen.js`
- [ ] Ajouter bouton "Voir lien de parenté avec..."
- [ ] Navigation vers `LienParenteScreen` avec membre pré-sélectionné

### Étape 3 : Phase 2 - Numérotation hiérarchique

#### 3.1 Backend - Modifier la génération de numéros
- [ ] Modifier `genererNumeroIdentification()` dans `Membre.js`
- [ ] Implémenter l'algorithme hiérarchique
- [ ] Gérer les cas racines vs enfants

#### 3.2 Backend - Modifier la route d'ajout
- [ ] Passer `pereId` et `mereId` à `genererNumeroIdentification()`
- [ ] Tester l'ajout de membres avec parents

#### 3.3 Backend - Migration données (si nécessaire)
- [ ] Créer script de renumérotation `renuméroter-membres.js`
- [ ] Tester sur une copie de la base
- [ ] Exécuter sur la base de production

#### 3.4 Frontend - Vérification
- [ ] Vérifier que les nouveaux numéros s'affichent correctement
- [ ] Tester l'ajout de plusieurs générations

### Étape 4 : Tests et validation
- [ ] Tester recherche par profession
- [ ] Tester recherche par lieu
- [ ] Tester recherche de lien de parenté
- [ ] Tester numérotation hiérarchique (racines)
- [ ] Tester numérotation hiérarchique (enfants)
- [ ] Tester numérotation hiérarchique (petits-enfants)

---

## Risques et considérations

### Risques

1. **Migration de numéros** : Si on renumérotele tout, les anciens numéros seront perdus
   - **Mitigation** : Sauvegarder l'ancien numéro dans un champ `ancien_numero_identification`

2. **Numérotation hiérarchique complexe** : Si l'arbre est incomplet ou mal formé
   - **Mitigation** : Gérer les cas où un enfant a seulement une mère (pas de père)

3. **Performance** : La recherche récursive de lien de parenté peut être lente sur de gros arbres
   - **Mitigation** : Limiter la profondeur de recherche à 10 niveaux (déjà fait dans le code)

4. **Collisions de numéros** : Si deux enfants sont ajoutés simultanément
   - **Mitigation** : Transaction SQL et vérification d'unicité

### Considérations techniques

1. **Index DB** : Ajouter un index sur `profession` et `lieu_residence` pour optimiser les recherches
   ```sql
   CREATE INDEX idx_membre_profession ON membre(profession);
   CREATE INDEX idx_membre_lieu_residence ON membre(lieu_residence);
   ```

2. **Validation frontend** : Empêcher de chercher un lien de parenté entre le même membre

3. **Cache** : Possibilité de cacher les liens de parenté calculés pour éviter de recalculer

---

## Estimation du travail

### Phase 1 : Recherche avancée
- **Backend** : 0h (déjà prêt)
- **Frontend API** : 0.5h
- **Frontend UI recherche** : 2h
- **Frontend UI lien parenté** : 3h
- **Tests** : 1h
- **Total Phase 1** : ~6.5 heures

### Phase 2 : Numérotation hiérarchique
- **Backend logique** : 2h
- **Backend migration** : 2h
- **Tests** : 1.5h
- **Total Phase 2** : ~5.5 heures

### **Estimation totale** : ~12 heures

---

## Alternatives considérées

### Alternative 1 : Utiliser un format de numéro différent
Au lieu de `002.001.003`, utiliser un format plus lisible comme `002-A-03` ou `002/1/3`
- **Rejeté** : Le format `.` est standard et plus facile à parser

### Alternative 2 : Stockage séparé du chemin hiérarchique
Ajouter un champ `path` dans la table membre qui stocke le chemin complet
- **Rejeté** : Redondant, le numéro suffit

### Alternative 3 : Ne pas renuméroter, créer un nouveau champ
Garder `numero_identification` actuel, créer `numero_hierarchique`
- **Considéré** : Bonne option si on veut garder les anciens numéros

---

## Prochaines étapes

1. **Poser les questions de clarification** à l'utilisateur
2. **Ajuster le plan** selon les réponses
3. **Commencer par Phase 1** (recherche) car le backend est déjà prêt
4. **Puis Phase 2** (numérotation) une fois la stratégie clarifiée
