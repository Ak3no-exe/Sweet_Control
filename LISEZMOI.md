# Sweet_Control : APK + notifications push

## A. Créer l'APK (sur ton PC : Node + Android Studio)
1. `mkdir www` puis mets ton `index.html` dedans (+ icônes / manifest si tu les as).
2. Colle `push-snippet.js` à la fin du dernier `<script>` de `www/index.html`.
3. `npm init -y`
4. `npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor-firebase/messaging`
5. `npx cap add android`
6. Copie `google-services.json` (Firebase > Paramètres du projet > ton appli Android, package `com.sweetcontrol.app`) dans `android/app/`.
7. `npx cap sync`
8. `npx cap open android` > Android Studio > Build > Build APK(s). Installe l'APK sur ton téléphone.

## B. Serveur (GitHub Actions, gratuit)
1. Crée un dépôt GitHub **privé** et mets-y `server/`, `.github/` (et rien d'autre de sensible).
2. Firebase > Paramètres > Comptes de service > « Générer une clé privée » (fichier JSON).
3. Dépôt > Settings > Secrets and variables > Actions, crée 3 secrets :
   - `JSONBIN_MASTER_KEY`
   - `JSONBIN_BIN_ID`
   - `FIREBASE_SERVICE_ACCOUNT` (tout le contenu du JSON)
4. Onglet Actions > « notify-new-players » > Run workflow (1re fois = il mémorise les joueurs existants sans notifier).
5. Ajoute un joueur de test : notif sous ~5 min (GitHub peut retarder un peu).

Notes :
- Appli ouverte : tu gardes les notifs actuelles de l'appli.
- GitHub met en pause les workflows planifiés après 60 jours sans activité sur le dépôt : relance-le à la main si ça arrive.
