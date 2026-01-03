/**
 * BALANCE - App Identity Configuration
 * 
 * Questo file contiene le costanti per la futura pubblicazione su:
 * - Apple App Store (iOS)
 * - Google Play Store (Android)
 * 
 * ⚠️ IMPORTANTE: Queste costanti NON sono attualmente utilizzate nell'app.
 * Sono preparate per la futura fase di deploy mobile.
 * 
 * NON modificare senza coordinamento con il processo di pubblicazione store.
 */

// ============== APP IDENTITY ==============

/**
 * Nome ufficiale dell'app negli store
 */
export const APP_NAME = 'BALANCE';

/**
 * Descrizione breve per store listing (max 80 caratteri)
 */
export const APP_TAGLINE = 'Decisioni chiare per la tua attività, ogni giorno';

/**
 * Descrizione completa per store
 */
export const APP_DESCRIPTION = `BALANCE è l'app di supporto decisionale per PMI, artigiani, negozi e professionisti italiani.

Funzionalità principali:
• Dashboard giornaliera con utile e stato operativo
• Gestione entrate e costi (fissi e variabili)
• Monitoraggio magazzino con sistema semaforo
• Insight AI personalizzati (GPT-5.2)
• Notifiche intelligenti per situazioni critiche

BALANCE non è un gestionale contabile, ma uno strumento pratico che ti aiuta a capire ogni giorno se stai guadagnando, dove stai perdendo margine e se rischi fermi operativi.

Piano Free:
- Dashboard base
- 1 insight AI giornaliero
- Gestione entrate e costi
- Magazzino base

Piano PRO (€39/mese):
- 3 insight AI completi
- Analisi predittive
- Notifiche push avanzate
- Impatto economico materiali

Privacy garantita: i tuoi dati sono privati, non vengono mai venduti o condivisi con terze parti.`;

// ============== STORE IDENTIFIERS ==============

/**
 * iOS Bundle Identifier
 * Formato: reverse-domain notation
 * 
 * PLACEHOLDER - da registrare su Apple Developer Account
 */
export const IOS_BUNDLE_ID = 'com.balance.app';

/**
 * Android Package Name
 * Deve coincidere con applicationId in build.gradle
 * 
 * PLACEHOLDER - da configurare in Android Studio
 */
export const ANDROID_PACKAGE_NAME = 'com.balance.app';

// ============== STORE CATEGORIES ==============

/**
 * Categoria primaria App Store
 * Apple: https://developer.apple.com/app-store/categories/
 */
export const IOS_PRIMARY_CATEGORY = 'Business';

/**
 * Categoria secondaria App Store (opzionale)
 */
export const IOS_SECONDARY_CATEGORY = 'Productivity';

/**
 * Categoria Google Play
 * Google: https://support.google.com/googleplay/android-developer/answer/9859673
 */
export const ANDROID_CATEGORY = 'BUSINESS';

// ============== TARGET AUDIENCE ==============

/**
 * Pubblico target principale
 */
export const TARGET_AUDIENCE = [
  'PMI (Piccole e Medie Imprese)',
  'Negozi e commercianti',
  'Artigiani e ditte',
  'Imprese edili e industriali',
  'Liberi professionisti',
  'Micro-imprese operative'
];

/**
 * Paesi target iniziali
 */
export const TARGET_COUNTRIES = ['IT']; // Italia

/**
 * Lingue supportate
 */
export const SUPPORTED_LANGUAGES = ['it-IT']; // Italiano

// ============== AGE RATING ==============

/**
 * Apple App Store: Age Rating
 * Nessun contenuto inappropriato, uso business
 */
export const IOS_AGE_RATING = '4+'; // Everyone

/**
 * Google Play: Content Rating
 * ESRB: Everyone
 */
export const ANDROID_CONTENT_RATING = 'Everyone';

// ============== CONTACT INFORMATION ==============

/**
 * Email di supporto ufficiale (visibile negli store)
 */
export const SUPPORT_EMAIL = 'cardinalegabrielsanto@gmail.com';

/**
 * Creatore / Fondatore
 */
export const CREATOR_NAME = 'Gabriel S. Cardinale';

// ============== VERSIONING ==============

/**
 * Versione corrente dell'app
 * Formato: MAJOR.MINOR.PATCH (Semantic Versioning)
 */
export const APP_VERSION = '1.0.0';

/**
 * Build number (incrementale)
 */
export const BUILD_NUMBER = '1';

// ============== STORE COMPLIANCE FLAGS ==============

/**
 * Conferma che l'app rispetta le linee guida
 */
export const STORE_COMPLIANCE = {
  // Apple App Store Review Guidelines
  ios: {
    noGambling: true,              // 2.1 - No gambling
    noOffensiveContent: true,       // 1.1 - No offensive content
    privacyPolicyPresent: true,     // 5.1.1 - Privacy policy required
    dataSafetyDisclosed: true,      // 5.1.2 - Data practices disclosed
    noExternalPayments: false,      // 3.1.1 - Use Apple IAP (da implementare)
    copyrightCompliant: true,       // 5.2 - Intellectual property
    functionalityComplete: true     // 2.1 - App must be complete
  },
  
  // Google Play Store Policies
  android: {
    noRestrictedContent: true,      // Restricted content policy
    dataSafetyFormComplete: false,  // Da compilare su Play Console
    privacyPolicyUrl: true,         // Privacy policy URL required
    contentRatingComplete: false,   // Da ottenere via IARC
    targetAPILevel: 33,             // Android 13 (API 33) minimum
    permissionsJustified: true      // All permissions have clear use case
  }
};

// ============== MONETIZATION ==============

/**
 * Modello di business
 */
export const MONETIZATION = {
  model: 'freemium',
  freeTier: {
    name: 'Free',
    features: [
      'Dashboard base',
      '1 insight AI giornaliero',
      'Gestione entrate e costi',
      'Magazzino base'
    ]
  },
  proTier: {
    name: 'PRO',
    priceMonthly: {
      amount: 39.00,
      currency: 'EUR'
    },
    priceYearly: {
      amount: 390.00,
      currency: 'EUR'
    },
    features: [
      '3 insight AI completi giornalieri',
      'Analisi predittive 7 giorni',
      'Notifiche push avanzate',
      'Impatto economico materiali',
      'Comparazioni temporali'
    ]
  },
  paymentProcessor: 'stripe', // Attualmente placeholder
  iapRequired: true // Per iOS/Android store, da implementare
};

// ============== EXPORT ==============

export default {
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
  IOS_BUNDLE_ID,
  ANDROID_PACKAGE_NAME,
  IOS_PRIMARY_CATEGORY,
  IOS_SECONDARY_CATEGORY,
  ANDROID_CATEGORY,
  TARGET_AUDIENCE,
  TARGET_COUNTRIES,
  SUPPORTED_LANGUAGES,
  IOS_AGE_RATING,
  ANDROID_CONTENT_RATING,
  SUPPORT_EMAIL,
  CREATOR_NAME,
  APP_VERSION,
  BUILD_NUMBER,
  STORE_COMPLIANCE,
  MONETIZATION
};
