# BALANCE - Store Compliance Checklist

## Stato: PREPARAZIONE (Non pubblicato)

Questo documento traccia i requisiti per la pubblicazione su Apple App Store e Google Play Store.

---

## ✅ COMPLETATI (App già conforme)

### Compliance Generale
- [x] Nome app definito: BALANCE
- [x] Descrizione e tagline pronti
- [x] Categoria definita: Business / Productivity
- [x] Target audience chiaro: PMI italiane
- [x] Privacy policy presente e accessibile (/privacy)
- [x] Disclaimer funzionali visibili
- [x] Email supporto ufficiale: cardinalegabrielsanto@gmail.com
- [x] Lingue supportate: Italiano (100%)
- [x] Age rating appropriato: 4+ / Everyone

### Contenuti e Funzionalità
- [x] App completamente funzionale
- [x] Nessun contenuto inappropriato
- [x] Nessun gambling o giochi d'azzardo
- [x] Nessuna violazione copyright
- [x] UI/UX mobile-responsive
- [x] Dark mode implementato

### Sicurezza e Privacy
- [x] Password hashate (bcrypt)
- [x] Sessioni protette
- [x] Isolamento dati per utente
- [x] Nessuna condivisione dati con terze parti
- [x] Nessuna vendita dati
- [x] Nessun tracking per advertising
- [x] Privacy policy completa e trasparente
- [x] Contatto privacy diretto via email

### Disclaimer e Responsabilità
- [x] Disclaimer "Non è sistema contabile"
- [x] Disclaimer "Non sostituisce commercialista"
- [x] Disclaimer AI "Non consulenza fiscale"
- [x] Messaggi chiari su limitazioni strumento

### Autenticazione
- [x] Google OAuth implementato
- [x] Email/Password implementato
- [x] Gestione sessioni sicura
- [x] Logout funzionante

### Monetizzazione (Struttura)
- [x] Piano Free definito
- [x] Piano PRO definito (€39/mese)
- [x] Paywall UI implementato
- [x] Feature gating Free vs PRO

---

## 📋 DA COMPLETARE (Pre-pubblicazione)

### Apple App Store Specifico
- [ ] Registrare Apple Developer Account (€99/anno)
- [ ] Creare App ID su Apple Developer Portal
- [ ] Registrare Bundle ID: com.balance.app
- [ ] Configurare App Store Connect
- [ ] Creare app listing su App Store Connect
- [ ] Preparare screenshot iOS (6.5", 5.5" display)
- [ ] Creare icon app 1024x1024px
- [ ] **Implementare Apple In-App Purchase** (obbligatorio per PRO)
- [ ] Testare su dispositivi iOS reali
- [ ] Build con Xcode o framework cross-platform
- [ ] Ottenere provisioning profiles
- [ ] Sottomettere per review

### Google Play Store Specifico
- [ ] Registrare Google Play Developer Account ($25 una tantum)
- [ ] Creare app su Google Play Console
- [ ] Registrare Package Name: com.balance.app
- [ ] Compilare Data Safety form (dettagli raccolta dati)
- [ ] Ottenere Content Rating via IARC
- [ ] Preparare screenshot Android (varie risoluzioni)
- [ ] Creare feature graphic 1024x500px
- [ ] **Implementare Google Play Billing** (obbligatorio per PRO)
- [ ] Generare APK/AAB signed
- [ ] Testare su dispositivi Android reali
- [ ] Target API Level 33+ (Android 13)
- [ ] Sottomettere per review

### Implementazione Mobile Nativa
- [ ] **DECISIONE TECNICA**: Scegliere approach
  - Opzione A: React Native (mantiene codebase React)
  - Opzione B: Flutter
  - Opzione C: Native iOS (Swift) + Native Android (Kotlin)
  - Opzione D: Capacitor / Ionic (web-to-mobile wrapper)
  
- [ ] Setup progetto mobile
- [ ] Migrare/Wrappare codice esistente
- [ ] Implementare notifiche push native (FCM per Android, APNs per iOS)
- [ ] Implementare IAP nativi (Apple IAP + Google Play Billing)
- [ ] Gestire permessi device (notifiche, etc)
- [ ] Testing su dispositivi fisici
- [ ] Performance optimization mobile

### Asset Grafici Richiesti
- [ ] App Icon 1024x1024px (iOS)
- [ ] App Icon adaptive (Android - varie densità)
- [ ] Screenshots iPhone (6.5", 5.5")
- [ ] Screenshots iPad (12.9", 11")
- [ ] Screenshots Android Phone (varie risoluzioni)
- [ ] Screenshots Android Tablet
- [ ] Feature Graphic 1024x500px (Google Play)
- [ ] Promotional video (opzionale ma consigliato)

### Legale e Amministrativo
- [ ] Conferma contratto sviluppatore con Apple
- [ ] Conferma contratto sviluppatore con Google
- [ ] Verifica export compliance (crittografia)
- [ ] Preparare Terms of Service pubblici
- [ ] Aggiornare Privacy Policy con dettagli IAP
- [ ] Configurare metodi di pagamento per ricevere pagamenti store

---

## ⚠️ DIPENDENZE CRITICHE

### Pagamenti In-App
**IMPORTANTE**: Sia Apple che Google RICHIEDONO l'uso dei loro sistemi IAP per subscription.

❌ **NON È POSSIBILE**:
- Usare Stripe direttamente nell'app mobile
- Bypass IAP store con payment esterni
- Link a pagine web esterne per upgrade

✅ **SOLUZIONE RICHIESTA**:
1. Implementare Apple In-App Purchase (StoreKit)
2. Implementare Google Play Billing
3. Backend sincronizza subscription status
4. Stripe può rimanere per web app

**Percentuali Store**:
- Apple: 30% primo anno, 15% dopo primo anno
- Google: 30% primo anno, 15% dopo primo anno

### Firebase Cloud Messaging
- [x] Struttura notifiche backend pronta
- [ ] Configurare progetto Firebase
- [ ] Implementare FCM per Android
- [ ] Implementare APNs per iOS
- [ ] Testare notifiche push su device reali

---

## 📊 TIMELINE STIMATA

### Fase 1: Setup Account e Progetti (1-2 settimane)
- Registrazione developer accounts
- Configurazione App Store Connect / Play Console
- Preparazione asset grafici

### Fase 2: Implementazione Mobile (4-8 settimane)
- Scelta e setup framework mobile
- Migrazione/wrapper codice esistente
- Implementazione IAP nativi
- Testing su device

### Fase 3: Submission e Review (1-3 settimane)
- Prima submission
- Eventuali fix per rejection
- Approvazione finale
- Pubblicazione

**TOTALE STIMATO**: 6-13 settimane dal via

---

## 🎯 PRIORITÀ PRE-LANCIO

### ALTA PRIORITÀ
1. Decisione framework mobile
2. Implementazione IAP (Apple + Google)
3. Asset grafici professionali
4. Testing su dispositivi reali

### MEDIA PRIORITÀ
1. Ottimizzazione performance mobile
2. Implementazione notifiche push native
3. Video promozionale
4. Localizzazione (se multi-lingua)

### BASSA PRIORITÀ
1. Widget iOS/Android
2. Watch app
3. Tablet optimization avanzata
4. Dark/Light mode switch (già dark)

---

## 📝 NOTE FINALI

**Stato Corrente**: BALANCE è pronto dal punto di vista di contenuti, compliance e funzionalità web. 

**Blocco Principale**: Manca implementazione mobile nativa e IAP store.

**Decisione Necessaria**: Scegliere framework mobile prima di procedere con pubblicazione store.

**Raccomandazione**: 
- Per time-to-market veloce: Capacitor (wrapper web)
- Per performance ottimale: React Native (mantiene React skillset)
- Per massima qualità: Native Swift + Kotlin (ma 2x development time)

---

Ultimo aggiornamento: 2 Gennaio 2025
