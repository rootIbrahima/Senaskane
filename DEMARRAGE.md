# Guide de démarrage - Senaskane Web App

## Démarrer le Backend (API)

Ouvrez un terminal et exécutez :

```bash
cd "c:\Users\lyibr\Desktop\MrSall\Senaskane\backend"
npm start
```

Le backend sera accessible sur : **http://localhost:3000**

---

## Démarrer le Frontend (React)

Ouvrez un **autre** terminal et exécutez :

```bash
cd "c:\Users\lyibr\Desktop\MrSall\Senaskane\web-app"
npm run dev
```

Le frontend sera accessible sur : **http://localhost:5173** ou **http://localhost:5174**

---

## Accéder à l'application

Une fois les deux serveurs démarrés, ouvrez votre navigateur et allez sur :
- **http://localhost:5173** (ou 5174 si 5173 est occupé)

---

## Fonctionnalités disponibles

### 🔐 Connexion

1. **Code Famille** - Entrez le code d'accès de votre famille
2. **Admin** - Connectez-vous avec votre identifiant et mot de passe

### 📝 Inscription

Cliquez sur "Créer un compte" pour :
- Créer une nouvelle famille
- Devenir administrateur de cette famille

Les champs requis sont :
- Nom de la famille
- Identifiant (login)
- Mot de passe (min 6 caractères)
- Nom et Prénom
- Email et Téléphone (optionnels)

---

## Arrêter les serveurs

Pour arrêter un serveur, appuyez sur **Ctrl+C** dans le terminal correspondant.

---

## Problèmes courants

### Port déjà utilisé
Si vous voyez "Port already in use" :
- Backend : Tuez le processus sur le port 3000
- Frontend : Vite choisira automatiquement un autre port (5174, 5175, etc.)

### Erreur CORS
Si vous avez des erreurs CORS :
1. **Redémarrez le backend** - La configuration CORS accepte maintenant tous les ports localhost
2. Vérifiez que le backend est bien démarré sur le port 3000
3. Vérifiez que les deux serveurs tournent en même temps

**Important** : Après toute modification du fichier `server.js`, vous devez redémarrer le backend (Ctrl+C puis relancer `npm start`)
