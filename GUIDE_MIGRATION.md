# Guide de migration - Code d'accès famille

## Problème identifié

L'erreur 500 sur `/api/auth/mon-code` est probablement due au fait que la colonne `code_acces` n'existe pas encore dans la base de données de production.

## Solution

Deux options pour exécuter la migration:

### Option 1: Via l'API (RECOMMANDÉ)

1. **Attendez que Render finisse le déploiement** (environ 2-3 minutes)
   - Vérifiez sur https://dashboard.render.com

2. **Connectez-vous à l'application** avec votre compte admin

3. **Ouvrez les outils de développement du navigateur** (F12)

4. **Dans la console, exécutez ce code:**

```javascript
// Récupérer votre token
const token = localStorage.getItem('token'); // ou sessionStorage selon votre config

// Appeler l'endpoint de migration
fetch('https://senaskane.onrender.com/api/admin/migrate-code-acces', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Résultat migration:', data))
.catch(err => console.error('Erreur:', err));
```

5. **Vérifiez le résultat** dans la console

6. **Rafraîchissez la page** et allez dans l'onglet Profil

### Option 2: Via le script local

Si l'option 1 ne fonctionne pas:

```bash
cd c:\Users\lyibr\Desktop\MrSall\Senaskane\backend
node scripts/migrate-code-acces.js
```

**Note:** Cette option nécessite que votre fichier `.env` pointe vers la base de données de production.

## Vérification

Pour vérifier si la migration a été effectuée:

```javascript
const token = localStorage.getItem('token');

fetch('https://senaskane.onrender.com/api/admin/check-migration', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('État migration:', data));
```

## Après la migration

1. Rafraîchissez l'application
2. Allez dans l'onglet "Profil"
3. Vous devriez voir le code d'accès de votre famille
4. Testez les boutons "Copier" et "Partager"
5. Déconnectez-vous et testez la connexion avec le code

## Suppression de l'endpoint admin

**IMPORTANT:** Une fois la migration effectuée, l'endpoint `/api/admin/migrate-code-acces` devrait être supprimé pour des raisons de sécurité.

Pour le supprimer:
1. Supprimez le fichier `backend/routes/admin.js`
2. Retirez l'import et l'utilisation dans `backend/server.js`
3. Commitez et poussez les changements
