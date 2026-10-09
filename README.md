# Los Malditos — site de recrutement GTA RP

Site statique HTML/CSS/JS pour GitHub Pages, avec formulaires, espace staff, stockage Supabase et notification Discord optionnelle.

## Fichiers
- `index.html`, `style.css`, `app.js` : site public et formulaire.
- `admin.html`, `admin.js` : connexion et tableau de candidatures.
- `config.js` : URL Supabase, clé publique et URL de la fonction Discord.
- `schema.sql` : tables et politiques de sécurité RLS.
- `supabase/functions/notify-discord/index.ts` : notification Discord côté serveur.

## 1. Créer Supabase
1. Crée un projet sur https://supabase.com/.
2. Ouvre SQL Editor, colle tout le contenu de `schema.sql` et exécute-le.
3. Dans Project Settings > API, copie Project URL et la clé **publishable** (ou ancienne clé `anon`).
4. Mets ces valeurs dans `config.js`. Ne mets JAMAIS une clé `service_role` ou `secret` dans ce fichier.
5. Dans Authentication, crée un utilisateur staff avec email et mot de passe.
6. Copie son User UID depuis Authentication > Users, puis exécute la requête d'exemple à la fin de `schema.sql` en remplaçant `UUID_DU_COMPTE` par cet UID. N'accorde le rôle admin qu'à des personnes de confiance.
7. Dans Authentication > URL Configuration, ajoute l'URL du site GitHub Pages comme URL autorisée si nécessaire.

## 2. Activer Discord (facultatif)
1. Crée un webhook dans un canal Discord réservé au staff et copie son URL.
2. Installe Supabase CLI et connecte-le au projet.
3. Déploie la fonction `notify-discord` selon le guide officiel Supabase Edge Functions.
4. Configure le secret côté serveur : `DISCORD_WEBHOOK_URL` = URL du webhook. Ne le colle jamais dans GitHub ni dans `config.js`.
5. Renseigne l'URL de la fonction déployée dans `DISCORD_FUNCTION_URL` de `config.js`.
6. Selon la configuration du projet, configure l'authentification de la fonction Edge afin que seuls les appels autorisés puissent la déclencher. Le message est générique et ne contient pas de données personnelles.

## 3. Publier sur GitHub Pages
1. Crée un dépôt GitHub nommé `los-malditos-recrutement`.
2. Ajoute tous les fichiers du dossier à la racine du dépôt, puis commit/push.
3. Ouvre Settings > Pages.
4. Sous Build and deployment, choisis `Deploy from a branch`, branche `main`, dossier `/(root)`, puis Save.
5. Attends la fin du déploiement. L'adresse sera de la forme `https://TON-PSEUDO.github.io/los-malditos-recrutement/`.

## Vérifications avant ouverture
- Teste une candidature avec des données fictives.
- Vérifie qu'un visiteur non connecté ne peut ni lire ni modifier les candidatures.
- Vérifie qu'un compte staff non admin n'accède pas au tableau.
- Ne stocke pas de vrais mots de passe, d'adresses personnelles ou de données sensibles.
- Le dépôt et le site Pages sont publics sur Internet. Le code ne doit contenir aucun secret.
- Ajoute une protection anti-spam/captcha et une politique de conservation/suppression avant un usage à grande échelle.

## Dépannage
- « Configuration manquante » : corrige `config.js`.
- Connexion admin refusée : vérifie l'utilisateur Supabase, puis la ligne dans `staff_profiles`.
- Liste inaccessible : réexécute `schema.sql` et vérifie que le bon UID a `is_admin = true`.
- Discord ne notifie pas : vérifie le déploiement de la fonction et le secret `DISCORD_WEBHOOK_URL`.

Docs : https://docs.github.com/en/pages ; https://supabase.com/docs/guides/database/postgres/row-level-security
