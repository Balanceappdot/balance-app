# Firebase Notifications Service
# Questo modulo gestisce l'invio di notifiche push tramite Firebase Cloud Messaging
# NOTA: Richiede configurazione Firebase (vedi FIREBASE_SETUP.md)

import os
from datetime import datetime, timezone
from typing import Optional

# Firebase Admin SDK (da installare quando necessario)
# pip install firebase-admin

# Placeholder per configurazione Firebase
FIREBASE_CONFIGURED = False

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    
    # Verifica se esiste il file di credenziali
    firebase_credentials_path = '/app/backend/firebase-admin.json'
    if os.path.exists(firebase_credentials_path):
        cred = credentials.Certificate(firebase_credentials_path)
        firebase_admin.initialize_app(cred)
        FIREBASE_CONFIGURED = True
        print("✅ Firebase configurato correttamente")
    else:
        print("⚠️  Firebase non configurato (file credenziali mancante)")
except ImportError:
    print("⚠️  Firebase Admin SDK non installato")
except Exception as e:
    print(f"⚠️  Errore configurazione Firebase: {e}")


async def send_notification(
    user_id: str,
    title: str,
    body: str,
    notification_type: str,
    db
) -> bool:
    """
    Invia una notifica push all'utente e salva in database
    
    Args:
        user_id: ID utente
        title: Titolo notifica
        body: Corpo notifica
        notification_type: Tipo (magazzino, stato, giornata_positiva)
        db: Database connection
    
    Returns:
        bool: True se inviata con successo
    """
    
    # Salva notifica in-app nel database
    notifica_doc = {
        "notifica_id": f"notif_{os.urandom(6).hex()}",
        "user_id": user_id,
        "tipo": notification_type,
        "titolo": title,
        "messaggio": body,
        "letta": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notifiche.insert_one(notifica_doc.copy())
    
    # Se Firebase è configurato, invia push notification
    if FIREBASE_CONFIGURED:
        try:
            # Recupera FCM token dell'utente (se salvato)
            user_doc = await db.users.find_one(
                {"user_id": user_id},
                {"_id": 0, "fcm_token": 1}
            )
            
            if user_doc and user_doc.get("fcm_token"):
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=title,
                        body=body
                    ),
                    token=user_doc["fcm_token"]
                )
                
                messaging.send(message)
                print(f"✅ Notifica push inviata a {user_id}")
                return True
        except Exception as e:
            print(f"❌ Errore invio notifica push: {e}")
    
    # Notifica in-app sempre salvata
    return True


async def check_and_send_notifications(user_id: str, db):
    """
    Controlla condizioni e invia notifiche appropriate
    
    Chiamare questo dopo:
    - Aggiornamento materiali
    - Calcolo dashboard giornaliero
    """
    
    # Verifica preferenze utente
    prefs = await db.notification_preferences.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    if not prefs or not prefs.get("notifiche_push_enabled"):
        return
    
    # 1. Check magazzino critico
    if prefs.get("notifiche_magazzino"):
        materiali_critici = await db.materiali.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(100)
        
        for m in materiali_critici:
            consumo = m.get("consumo_medio_giornaliero", 0)
            if consumo > 0:
                giorni_rimasti = m["quantita_disponibile"] / consumo
                giorni_consegna = m.get("giorni_consegna", 0)
                
                if giorni_rimasti <= giorni_consegna:
                    await send_notification(
                        user_id=user_id,
                        title="🔴 Magazzino Critico",
                        body=f"{m['nome']}: ordina ora per evitare fermi operativi",
                        notification_type="magazzino",
                        db=db
                    )
    
    # 2. Check stato operativo
    if prefs.get("notifiche_stato"):
        # Calcola dashboard oggi
        from datetime import date
        oggi = date.today().isoformat()
        
        # Query entrate/costi (semplificato)
        entrate = await db.entrate.find(
            {"user_id": user_id, "data": oggi},
            {"_id": 0}
        ).to_list(100)
        
        costi_var = await db.costi_variabili.find(
            {"user_id": user_id, "data": oggi},
            {"_id": 0}
        ).to_list(100)
        
        costi_fissi = await db.costi_fissi.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(100)
        
        totale_entrate = sum(e["importo"] for e in entrate)
        totale_costi_var = sum(c["importo"] for c in costi_var)
        totale_quota_fissi = sum(c["quota_giornaliera"] for c in costi_fissi)
        
        utile = totale_entrate - (totale_costi_var + totale_quota_fissi)
        
        if utile < -100:  # Stato critico
            await send_notification(
                user_id=user_id,
                title="⚠️ Stato Critico",
                body=f"Oggi: €{utile:.2f}. Rivedi costi e entrate",
                notification_type="stato",
                db=db
            )
    
    # 3. Check giornata positiva
    if prefs.get("notifiche_giornata_positiva"):
        # Usa stesso calcolo di sopra
        # (in produzione, ottimizzare per evitare doppia query)
        pass


# Export functions
__all__ = ['send_notification', 'check_and_send_notifications', 'FIREBASE_CONFIGURED']
