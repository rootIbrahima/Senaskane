# Configuration Resend pour l'envoi d'emails

## Pourquoi Resend ?

- ✅ **Gratuit** : 100 emails/jour sans carte de crédit
- ✅ **Fiable** : Fonctionne parfaitement avec les déploiements cloud (Render, Vercel, etc.)
- ✅ **Simple** : Configuration en 5 minutes
- ✅ **Moderne** : API REST simple et performante

Gmail SMTP pose souvent des problèmes sur les serveurs cloud (timeouts, blocages de sécurité).

## Étapes de configuration

### 1. Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Cliquez sur **Sign Up**
3. Inscrivez-vous avec votre email
4. Confirmez votre adresse email

### 2. Créer une API Key

1. Connectez-vous à votre dashboard Resend
2. Allez dans **API Keys**
3. Cliquez sur **Create API Key**
4. Donnez un nom (ex: "Senaskane Production")
5. Choisissez les permissions : **Sending access**
6. Cliquez sur **Add**
7. **IMPORTANT** : Copiez immédiatement la clé (elle commence par `re_`)

### 3. Configurer sur Render

1. Allez sur votre service backend sur [Render](https://render.com)
2. Cliquez sur **Environment**
3. Ajoutez une nouvelle variable d'environnement :
   - **Key** : `RESEND_API_KEY`
   - **Value** : `re_votre_cle_api_copiee`
4. Ajoutez également (optionnel) :
   - **Key** : `EMAIL_FROM`
   - **Value** : `"Senaskane <onboarding@resend.dev>"`
5. Cliquez sur **Save Changes**
6. Render redémarrera automatiquement votre service

### 4. (Optionnel) Configurer un domaine personnalisé

Pour envoyer depuis votre propre domaine (ex: `noreply@senaskane.com`) :

1. Dans Resend, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre domaine
4. Suivez les instructions pour ajouter les enregistrements DNS
5. Une fois vérifié, mettez à jour `EMAIL_FROM` sur Render

**Note** : Vous pouvez utiliser `onboarding@resend.dev` pour les tests (gratuit, aucune configuration requise).

## Test de la configuration

Une fois configuré sur Render, testez l'envoi d'email :

1. Créez une invitation dans l'application
2. Vérifiez les logs sur Render :
   ```
   📧 Envoi via Resend à: user@example.com
   ✅ Email envoyé via Resend: abc123def
   ```

## Limites du plan gratuit

- **100 emails/jour**
- **1 domaine personnalisé**
- **Pas de support prioritaire**

Pour la plupart des applications familiales, c'est largement suffisant !

## Fallback sur SMTP

Si Resend n'est pas configuré ou échoue, le système essaiera automatiquement d'utiliser SMTP (Gmail) si les variables `SMTP_USER` et `SMTP_PASS` sont définies.

## Support

- Documentation Resend : [https://resend.com/docs](https://resend.com/docs)
- Support : [support@resend.com](mailto:support@resend.com)
