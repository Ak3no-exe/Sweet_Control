import fs from 'node:fs';
import admin from 'firebase-admin';

// Valeurs écrites directement (dépôt privé uniquement !)
const BIN_ID = '6a913440da38895dfe1b2aeb';
const MASTER_KEY = '$2a$10$C1NDhq/quo0lnjpvMCXwGerQa/hhT6qo.3RyxqJxgZAbnNtNBEuuy';

const GAMES = { fortnite: 'Fortnite', rl: 'Rocket League Sideswipe', rlstd: 'Rocket League', brawl: 'Brawl Stars' };
const STATE = 'server/state.json';

const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
  headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Meta': 'false' }
});
if (!res.ok) throw new Error('jsonbin HTTP ' + res.status);
const data = await res.json();

const known = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : null;
const current = {};
for (const g of Object.keys(GAMES)) current[g] = Array.isArray(data[g]) ? data[g].map(p => p.id) : [];

// 1re exécution : on mémorise l'existant sans rien notifier.
if (known) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  for (const g of Object.keys(GAMES)) {
    const old = new Set(known[g] || []);
    for (const p of (data[g] || [])) {
      if (old.has(p.id)) continue;
      await admin.messaging().send({
        topic: 'new-players',
        notification: { title: 'Nouveau joueur !', body: `${p.pseudo} vient d'arriver dans ${GAMES[g]}.` },
        android: { priority: 'high' }
      });
      console.log('Notif envoyée :', p.pseudo, g);
    }
  }
}
fs.writeFileSync(STATE, JSON.stringify(current));
