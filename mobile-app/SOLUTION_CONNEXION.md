# 🔧 Solution au problème "Site inaccessible" sur Expo Go

## ❌ Problème
Vous obtenez le message "ce site est inaccessible" sur Expo Go.

## ✅ Solutions (dans l'ordre)

---

## Solution 1 : Utiliser le mode Tunnel ⭐ (RECOMMANDÉ)

Le mode tunnel fonctionne même si votre téléphone et PC ne sont pas sur le même WiFi.

### Étapes :

1. **Ouvrir un terminal** dans le dossier mobile-app

2. **Arrêter tous les serveurs Expo** :
   ```bash
   # Windows (dans PowerShell ou CMD)
   taskkill /F /IM node.exe
   ```

3. **Démarrer Expo en mode tunnel** :
   ```bash
   cd Senaskane/mobile-app
   npx expo start --tunnel
   ```

4. **Attendre** que le message apparaisse :
   ```
   › Metro waiting on exp://xxx.xxx.xxx.xxx:8081
   › Tunnel ready
   ```

5. **Scanner le QR code** avec Expo Go sur votre téléphone

6. **Patienter** (le mode tunnel peut prendre 30-60 secondes au premier chargement)

---

## Solution 2 : Vérifier le réseau WiFi

### Étapes :

1. **Vérifier que votre PC et téléphone sont sur le MÊME WiFi**
   - PC : Paramètres Windows > Réseau
   - Téléphone : Paramètres > WiFi
   - Les deux doivent afficher le même nom de réseau

2. **Désactiver temporairement le pare-feu Windows** :
   - Ouvrir : Paramètres > Mise à jour et sécurité > Sécurité Windows
   - Pare-feu > Désactiver temporairement
   - Essayer de se connecter
   - Réactiver ensuite

3. **Tester la connexion** :
   - Sur votre téléphone, ouvrir le navigateur
   - Taper : `http://192.168.1.111:8081`
   - Si ça charge, le réseau fonctionne
   - Si erreur, problème de pare-feu/réseau

---

## Solution 3 : Utiliser LAN (connexion locale)

### Étapes :

1. **Vérifier votre IP** :
   ```bash
   ipconfig
   ```
   Chercher "Carte réseau sans fil Wi-Fi" → "Adresse IPv4" : **192.168.1.111**

2. **Démarrer Expo normalement** :
   ```bash
   cd Senaskane/mobile-app
   npm start
   ```

3. **Dans le terminal Expo, appuyer sur "s"** pour changer le mode de connexion

4. **Choisir "LAN"**

5. **Scanner le nouveau QR code**

---

## Solution 4 : Réinstaller les dépendances

Si rien ne fonctionne :

```bash
cd Senaskane/mobile-app

# Supprimer node_modules
rm -rf node_modules

# Réinstaller
npm install

# Nettoyer le cache Expo
npx expo start -c
```

---

## 🔍 Diagnostic rapide

### Test 1 : Vérifier que Expo démarre
```bash
cd Senaskane/mobile-app
npm start
```

Vous devriez voir :
```
› Metro waiting on exp://192.168.1.111:8081
› Scan the QR code above
```

### Test 2 : Vérifier la connexion backend
Ouvrir un autre terminal :
```bash
cd Senaskane/backend
node server.js
```

Vous devriez voir :
```
🌳 SENASKANE API DÉMARRÉE
📍 URL: http://0.0.0.0:3000
```

### Test 3 : Tester depuis le navigateur du téléphone
Sur votre téléphone, ouvrir le navigateur et taper :
```
http://192.168.1.111:8081
```

Si ça charge, le problème vient d'Expo Go, pas du réseau.

---

## 📝 Checklist de dépannage

- [ ] Les deux appareils sont sur le même WiFi
- [ ] Le serveur Expo est démarré (npm start)
- [ ] Le backend Node est démarré (node server.js)
- [ ] L'URL dans config.js est correcte (192.168.1.111)
- [ ] Expo Go est installé sur le téléphone
- [ ] Le pare-feu Windows est désactivé (temporairement)
- [ ] Le QR code est bien scanné depuis Expo Go (pas l'appareil photo)

---

## 🚀 Commandes utiles

### Démarrer en mode tunnel (recommandé) :
```bash
npx expo start --tunnel
```

### Nettoyer et redémarrer :
```bash
npx expo start -c
```

### Changer de port si 8081 est occupé :
```bash
npx expo start --port 8082
```

### Voir les logs détaillés :
```bash
npx expo start --verbose
```

---

## 💡 Astuce finale

Si **rien ne fonctionne**, essayez cette solution simple :

1. **Installer "Expo" app au lieu de "Expo Go"** (si disponible dans votre région)

2. **Ou utiliser l'émulateur Android** sur PC :
   ```bash
   npm run android
   ```
   (Nécessite Android Studio)

3. **Ou utiliser le mode web** :
   ```bash
   npm run web
   ```
   (S'ouvre dans le navigateur)

---

## 📞 Besoin d'aide ?

Si le problème persiste, vérifiez :

1. **Votre réseau WiFi** permet-il la communication entre appareils ?
   - Certains WiFi publics/entreprise bloquent cette communication
   - Essayez avec un partage de connexion (hotspot) depuis le téléphone

2. **Votre antivirus** ne bloque-t-il pas la connexion ?
   - Désactiver temporairement pour tester

3. **Votre routeur** a-t-il activé l'isolation WiFi ?
   - Paramètres routeur > Désactiver "AP Isolation"

---

## ✅ Mode Tunnel - La solution qui marche toujours !

**Le mode tunnel passe par les serveurs d'Expo**, donc il fonctionne même si :
- Votre PC et téléphone ne sont pas sur le même WiFi
- Votre pare-feu bloque les connexions
- Votre routeur a l'isolation activée

**C'est la solution la plus fiable !**

```bash
npx expo start --tunnel
```

Bon développement ! 🎉
