# Firebase Cloud Messaging - Guida Setup

## Prerequisiti
1. Crea un progetto Firebase: https://console.firebase.google.com
2. Registra la web app nel progetto Firebase
3. Scarica il service account JSON da Project Settings > Service Accounts

## Configurazione Backend

1. Aggiungi le credenziali Firebase in `/app/backend/firebase-admin.json` (NON committare)
2. Aggiungi in `.gitignore`: `firebase-admin.json`

## Configurazione Frontend

1. Aggiungi le variabili in `/app/frontend/.env`:
```
REACT_APP_FIREBASE_API_KEY=your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

2. Crea `/app/frontend/public/firebase-messaging-sw.js` per il service worker

## Testing

Per testare senza credenziali Firebase reali:
- I toggle nel profilo funzionano e salvano le preferenze
- Le notifiche push verranno mostrate quando Firebase sarà configurato
- Sistema notifiche in-app già funzionante

## Eventi Notifiche

Backend controllerà:
1. Materiale con stato "ordina_ora" → Notifica magazzino critico
2. Dashboard con stato "critico" → Notifica stato operativo
3. Dashboard con utile > 0 → Notifica giornata positiva

## Next Steps

1. Utente crea progetto Firebase
2. Fornisce credenziali (service account JSON + web config)
3. Aggiungi credenziali nei file indicati
4. Riavvia backend/frontend
5. Test notifiche push reali
