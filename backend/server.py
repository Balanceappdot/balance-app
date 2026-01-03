from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import asyncio
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime
    subscription_tier: str = "free"

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    tipo_attivita: str
    settore: str
    obiettivi: List[str]
    created_at: datetime

class CostoFisso(BaseModel):
    model_config = ConfigDict(extra="ignore")
    costo_id: str
    user_id: str
    descrizione: str
    importo_mensile: float
    quota_giornaliera: float
    created_at: datetime

class CostoVariabile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    costo_id: str
    user_id: str
    descrizione: str
    importo: float
    data: str
    created_at: datetime

class Entrata(BaseModel):
    model_config = ConfigDict(extra="ignore")
    entrata_id: str
    user_id: str
    descrizione: str
    importo: float
    data: str
    tipo: str = "registrata"
    created_at: datetime

class Materiale(BaseModel):
    model_config = ConfigDict(extra="ignore")
    materiale_id: str
    user_id: str
    nome: str
    quantita_disponibile: float
    unita_misura: str
    consumo_medio_giornaliero: Optional[float] = 0
    giorni_consegna: Optional[int] = 0
    costo_unitario: Optional[float] = 0
    created_at: datetime

class Notifica(BaseModel):
    model_config = ConfigDict(extra="ignore")
    notifica_id: str
    user_id: str
    tipo: str
    titolo: str
    messaggio: str
    letta: bool = False
    created_at: datetime

class InsightAI(BaseModel):
    model_config = ConfigDict(extra="ignore")
    insight_id: str
    user_id: str
    data: str
    tipo: str
    contenuto: str
    created_at: datetime

# ============== INPUT MODELS ==============

class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class OnboardingInput(BaseModel):
    tipo_attivita: str
    settore: str
    obiettivi: List[str]

class CostoFissoInput(BaseModel):
    descrizione: str
    importo_mensile: float

class CostoVariabileInput(BaseModel):
    descrizione: str
    importo: float
    data: str

class EntrataInput(BaseModel):
    descrizione: str
    importo: float
    data: str
    tipo: str = "registrata"

class MaterialeInput(BaseModel):
    nome: str
    quantita_disponibile: float
    unita_misura: str
    consumo_medio_giornaliero: Optional[float] = 0
    giorni_consegna: Optional[int] = 0
    costo_unitario: Optional[float] = 0
    # Fornitore (campi opzionali)
    fornitore: Optional[str] = None
    fornitore_email: Optional[str] = None
    fornitore_telefono: Optional[str] = None
    fornitore_sito: Optional[str] = None

class MaterialeUpdate(BaseModel):
    quantita_disponibile: Optional[float] = None
    consumo_medio_giornaliero: Optional[float] = None
    giorni_consegna: Optional[int] = None
    costo_unitario: Optional[float] = None
    # Fornitore (campi opzionali)
    fornitore: Optional[str] = None
    fornitore_email: Optional[str] = None
    fornitore_telefono: Optional[str] = None
    fornitore_sito: Optional[str] = None

# ============== HELPER FUNCTIONS ==============

async def get_session_from_cookie(session_token: Optional[str]) -> Optional[dict]:
    """Get session from cookie or Authorization header"""
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    return session_doc

async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Get current user from session"""
    # Try cookie first
    if not session_token:
        # Try Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    session_doc = await get_session_from_cookie(session_token)
    if not session_doc:
        raise HTTPException(status_code=401, detail="Non autorizzato")
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    # Convert timestamp if needed
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register")
async def register(input: RegisterInput, response: Response):
    """Register new user with email and password"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Utente già registrato con questa email")
    
    # Hash password
    hashed_password = bcrypt.hashpw(input.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create new user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": input.email,
        "name": input.name,
        "password_hash": hashed_password.decode('utf-8'),
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "subscription_tier": "free",
        "auth_method": "email"
    }
    
    await db.users.insert_one(user_doc.copy())
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    # Check if user has profile
    profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user": {
            "user_id": user_id,
            "email": input.email,
            "name": input.name,
            "picture": None,
            "subscription_tier": "free"
        },
        "has_profile": profile is not None
    }

@api_router.post("/auth/login")
async def login(input: LoginInput, response: Response):
    """Login with email and password"""
    # Find user
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc or user_doc.get("auth_method") != "email":
        raise HTTPException(status_code=401, detail="Email o password non corretti")
    
    # Verify password
    if not bcrypt.checkpw(input.password.encode('utf-8'), user_doc["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Email o password non corretti")
    
    user_id = user_doc["user_id"]
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    # Check if user has profile
    profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user": {
            "user_id": user_id,
            "email": user_doc["email"],
            "name": user_doc["name"],
            "picture": user_doc.get("picture"),
            "subscription_tier": user_doc.get("subscription_tier", "free")
        },
        "has_profile": profile is not None
    }

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process session_id from Emergent auth"""
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id mancante")
    
    # Call Emergent auth API
    import aiohttp
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            ) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=401, detail="Autenticazione fallita")
                
                auth_data = await resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Errore autenticazione: {str(e)}")
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if not user_doc:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "subscription_tier": "free"
        }
        await db.users.insert_one(user_doc.copy())
    else:
        user_id = user_doc["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data.get("picture")
            }}
        )
    
    # Create session
    session_token = auth_data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    # Check if user has profile
    profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user": {
            "user_id": user_id,
            "email": user_doc.get("email", auth_data["email"]),
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "subscription_tier": user_doc.get("subscription_tier", "free")
        },
        "has_profile": profile is not None
    }

@api_router.get("/auth/me")
async def get_me(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current user"""
    user = await get_current_user(request, session_token)
    
    # Check if user has profile
    profile = await db.user_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
    
    return {
        "user": user.model_dump(),
        "has_profile": profile is not None
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie("session_token", path="/")
    return {"message": "Logout effettuato"}

# ============== ONBOARDING ROUTES ==============

@api_router.post("/onboarding")
async def complete_onboarding(request: Request, input: OnboardingInput, session_token: Optional[str] = Cookie(None)):
    """Complete user onboarding"""
    user = await get_current_user(request, session_token)
    
    # Check if profile already exists
    existing = await db.user_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Profilo già esistente")
    
    profile_doc = {
        "user_id": user.user_id,
        "tipo_attivita": input.tipo_attivita,
        "settore": input.settore,
        "obiettivi": input.obiettivi,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_profiles.insert_one(profile_doc.copy())
    # Return profile without MongoDB _id
    profile_doc.pop('_id', None)
    return {"message": "Onboarding completato", "profile": profile_doc}

@api_router.get("/profile")
async def get_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user profile"""
    user = await get_current_user(request, session_token)
    
    profile = await db.user_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profilo non trovato")
    
    # Get notification preferences
    notif_prefs = await db.notification_preferences.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not notif_prefs:
        # Create default preferences
        notif_prefs = {
            "user_id": user.user_id,
            "notifiche_push_enabled": True,
            "notifiche_magazzino": True,
            "notifiche_stato": True,
            "notifiche_giornata_positiva": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notification_preferences.insert_one(notif_prefs.copy())
    
    return {
        "user": user.model_dump(),
        "profile": profile,
        "notification_preferences": notif_prefs
    }

@api_router.patch("/profile/notifications")
async def update_notification_preferences(request: Request, session_token: Optional[str] = Cookie(None)):
    """Update notification preferences"""
    user = await get_current_user(request, session_token)
    data = await request.json()
    
    # Update preferences
    await db.notification_preferences.update_one(
        {"user_id": user.user_id},
        {"$set": data},
        upsert=True
    )
    
    return {"message": "Preferenze aggiornate"}

# ============== DASHBOARD ROUTES ==============

@api_router.get("/dashboard")
async def get_dashboard(request: Request, data: str, session_token: Optional[str] = Cookie(None)):
    """Get dashboard data for a specific date"""
    user = await get_current_user(request, session_token)
    
    # Get entrate for the day
    entrate = await db.entrate.find(
        {"user_id": user.user_id, "data": data},
        {"_id": 0}
    ).to_list(1000)
    
    totale_entrate = sum(e["importo"] for e in entrate)
    
    # Get costi variabili for the day
    costi_var = await db.costi_variabili.find(
        {"user_id": user.user_id, "data": data},
        {"_id": 0}
    ).to_list(1000)
    
    totale_costi_var = sum(c["importo"] for c in costi_var)
    
    # Get costi fissi (quota giornaliera)
    costi_fissi = await db.costi_fissi.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    
    totale_quota_fissi = sum(c["quota_giornaliera"] for c in costi_fissi)
    
    # Calculate utile
    totale_costi = totale_costi_var + totale_quota_fissi
    utile = totale_entrate - totale_costi
    
    # Determine stato
    if utile > 0:
        stato = "positivo"
    elif utile >= -100:
        stato = "attenzione"
    else:
        stato = "critico"
    
    return {
        "data": data,
        "utile": round(utile, 2),
        "entrate": round(totale_entrate, 2),
        "costi": round(totale_costi, 2),
        "costi_variabili": round(totale_costi_var, 2),
        "quota_fissi": round(totale_quota_fissi, 2),
        "stato": stato
    }

# ============== COSTI ROUTES ==============

@api_router.get("/costi/fissi")
async def get_costi_fissi(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get all fixed costs"""
    user = await get_current_user(request, session_token)
    
    costi = await db.costi_fissi.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    
    return costi

@api_router.post("/costi/fissi")
async def create_costo_fisso(request: Request, input: CostoFissoInput, session_token: Optional[str] = Cookie(None)):
    """Create fixed cost"""
    user = await get_current_user(request, session_token)
    
    costo_doc = {
        "costo_id": f"cf_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "descrizione": input.descrizione,
        "importo_mensile": input.importo_mensile,
        "quota_giornaliera": round(input.importo_mensile / 30, 2),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.costi_fissi.insert_one(costo_doc.copy())
    # Return document without MongoDB _id
    costo_doc.pop('_id', None)
    return costo_doc

@api_router.delete("/costi/fissi/{costo_id}")
async def delete_costo_fisso(request: Request, costo_id: str, session_token: Optional[str] = Cookie(None)):
    """Delete fixed cost"""
    user = await get_current_user(request, session_token)
    
    result = await db.costi_fissi.delete_one({"costo_id": costo_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Costo non trovato")
    
    return {"message": "Costo eliminato"}

@api_router.get("/costi/variabili")
async def get_costi_variabili(request: Request, data: Optional[str] = None, session_token: Optional[str] = Cookie(None)):
    """Get variable costs"""
    user = await get_current_user(request, session_token)
    
    query = {"user_id": user.user_id}
    if data:
        query["data"] = data
    
    costi = await db.costi_variabili.find(query, {"_id": 0}).to_list(1000)
    return costi

@api_router.post("/costi/variabili")
async def create_costo_variabile(request: Request, input: CostoVariabileInput, session_token: Optional[str] = Cookie(None)):
    """Create variable cost"""
    user = await get_current_user(request, session_token)
    
    costo_doc = {
        "costo_id": f"cv_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "descrizione": input.descrizione,
        "importo": input.importo,
        "data": input.data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.costi_variabili.insert_one(costo_doc.copy())
    # Return document without MongoDB _id
    costo_doc.pop('_id', None)
    return costo_doc

@api_router.delete("/costi/variabili/{costo_id}")
async def delete_costo_variabile(request: Request, costo_id: str, session_token: Optional[str] = Cookie(None)):
    """Delete variable cost"""
    user = await get_current_user(request, session_token)
    
    result = await db.costi_variabili.delete_one({"costo_id": costo_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Costo non trovato")
    
    return {"message": "Costo eliminato"}

# ============== ENTRATE ROUTES ==============

@api_router.get("/entrate")
async def get_entrate(request: Request, data: Optional[str] = None, session_token: Optional[str] = Cookie(None)):
    """Get entrate"""
    user = await get_current_user(request, session_token)
    
    query = {"user_id": user.user_id}
    if data:
        query["data"] = data
    
    entrate = await db.entrate.find(query, {"_id": 0}).to_list(1000)
    return entrate

@api_router.post("/entrate")
async def create_entrata(request: Request, input: EntrataInput, session_token: Optional[str] = Cookie(None)):
    """Create entrata"""
    user = await get_current_user(request, session_token)
    
    entrata_doc = {
        "entrata_id": f"ent_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "descrizione": input.descrizione,
        "importo": input.importo,
        "data": input.data,
        "tipo": input.tipo,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.entrate.insert_one(entrata_doc.copy())
    # Return document without MongoDB _id
    entrata_doc.pop('_id', None)
    return entrata_doc

@api_router.delete("/entrate/{entrata_id}")
async def delete_entrata(request: Request, entrata_id: str, session_token: Optional[str] = Cookie(None)):
    """Delete entrata"""
    user = await get_current_user(request, session_token)
    
    result = await db.entrate.delete_one({"entrata_id": entrata_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entrata non trovata")
    
    return {"message": "Entrata eliminata"}

# ============== MATERIALI ROUTES ==============

@api_router.get("/materiali")
async def get_materiali(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get materiali with status"""
    user = await get_current_user(request, session_token)
    
    materiali = await db.materiali.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Calculate status for each materiale
    for m in materiali:
        consumo = m.get("consumo_medio_giornaliero", 0)
        if consumo > 0:
            giorni_rimasti = m["quantita_disponibile"] / consumo
            giorni_consegna = m.get("giorni_consegna", 0)
            
            if giorni_rimasti <= giorni_consegna:
                m["stato"] = "ordina_ora"
            elif giorni_rimasti <= giorni_consegna * 2:
                m["stato"] = "attenzione"
            else:
                m["stato"] = "ok"
            
            m["giorni_rimasti"] = round(giorni_rimasti, 1)
        else:
            m["stato"] = "ok"
            m["giorni_rimasti"] = None
    
    return materiali

@api_router.post("/materiali")
async def create_materiale(request: Request, input: MaterialeInput, session_token: Optional[str] = Cookie(None)):
    """Create materiale"""
    user = await get_current_user(request, session_token)
    
    materiale_doc = {
        "materiale_id": f"mat_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "nome": input.nome,
        "quantita_disponibile": input.quantita_disponibile,
        "unita_misura": input.unita_misura,
        "consumo_medio_giornaliero": input.consumo_medio_giornaliero,
        "giorni_consegna": input.giorni_consegna,
        "costo_unitario": input.costo_unitario,
        "fornitore": input.fornitore,
        "fornitore_email": input.fornitore_email,
        "fornitore_telefono": input.fornitore_telefono,
        "fornitore_sito": input.fornitore_sito,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.materiali.insert_one(materiale_doc.copy())
    # Return document without MongoDB _id
    materiale_doc.pop('_id', None)
    return materiale_doc

@api_router.patch("/materiali/{materiale_id}")
async def update_materiale(request: Request, materiale_id: str, input: MaterialeUpdate, session_token: Optional[str] = Cookie(None)):
    """Update materiale"""
    user = await get_current_user(request, session_token)
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
    
    result = await db.materiali.update_one(
        {"materiale_id": materiale_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Materiale non trovato")
    
    return {"message": "Materiale aggiornato"}

@api_router.delete("/materiali/{materiale_id}")
async def delete_materiale(request: Request, materiale_id: str, session_token: Optional[str] = Cookie(None)):
    """Delete materiale"""
    user = await get_current_user(request, session_token)
    
    result = await db.materiali.delete_one({"materiale_id": materiale_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Materiale non trovato")
    
    return {"message": "Materiale eliminato"}

# ============== INSIGHT AI ROUTES ==============

@api_router.get("/insights")
async def get_insights(request: Request, data: str, session_token: Optional[str] = Cookie(None)):
    """Get AI insights for a specific date"""
    user = await get_current_user(request, session_token)
    
    # Check if insights already exist for this date
    existing = await db.insights_ai.find(
        {"user_id": user.user_id, "data": data},
        {"_id": 0}
    ).to_list(100)
    
    if existing:
        return existing
    
    # Generate new insights
    profile = await db.user_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
    
    # Get dashboard data
    dashboard = await get_dashboard(request, data, session_token)
    
    # Get entrate and costi for context
    entrate = await db.entrate.find({"user_id": user.user_id, "data": data}, {"_id": 0}).to_list(100)
    costi_var = await db.costi_variabili.find({"user_id": user.user_id, "data": data}, {"_id": 0}).to_list(100)
    costi_fissi = await db.costi_fissi.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    
    # Get materiali status
    materiali = await get_materiali(request, session_token)
    materiali_critici = [m for m in materiali if m.get("stato") == "ordina_ora"]
    
    # Prepare context for AI
    context = f"""
Data: {data}
Tipo attività: {profile.get('tipo_attivita', 'N/A') if profile else 'N/A'}
Settore: {profile.get('settore', 'N/A') if profile else 'N/A'}

Dashboard:
- Utile: €{dashboard['utile']}
- Entrate: €{dashboard['entrate']}
- Costi totali: €{dashboard['costi']}
- Stato: {dashboard['stato']}

Entrate ({len(entrate)}): {', '.join([f"{e['descrizione']} (€{e['importo']})" for e in entrate[:3]])}
Costi variabili ({len(costi_var)}): {', '.join([f"{c['descrizione']} (€{c['importo']})" for c in costi_var[:3]])}
Costi fissi mensili: {len(costi_fissi)} voci
Materiali critici: {len(materiali_critici)}
"""
    
    insights = []
    
    if user.subscription_tier == "free":
        # FREE: 1 insight generico
        prompt = f"""Sei un consulente aziendale per PMI italiane. Basandoti sui dati forniti, genera UN SOLO insight breve (max 2 frasi) per l'utente.

{context}

L'insight deve essere:
- Pratico e operativo
- In italiano semplice
- Prudente (usa "potrebbe", "sembra", "considera")
- Senza certezze assolute

Non parlare di tasse, IVA o contabilità fiscale.
"""
        
        try:
            llm = LlmChat(
                api_key=os.environ.get('EMERGENT_LLM_KEY'),
                session_id=f"insight_{user.user_id}_{data}",
                system_message="Sei un consulente aziendale che fornisce suggerimenti prudenti e pratici."
            )
            llm.with_model("openai", "gpt-5.2")
            
            user_message = UserMessage(text=prompt)
            response = await llm.send_message(user_message)
            
            insights.append({
                "insight_id": f"ins_{uuid.uuid4().hex[:12]}",
                "user_id": user.user_id,
                "data": data,
                "tipo": "generale",
                "contenuto": response.strip(),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        except Exception as e:
            # Fallback insight
            insights.append({
                "insight_id": f"ins_{uuid.uuid4().hex[:12]}",
                "user_id": user.user_id,
                "data": data,
                "tipo": "generale",
                "contenuto": f"Il tuo utile oggi è di €{dashboard['utile']}. {'Ottimo lavoro!' if dashboard['utile'] > 0 else 'Considera di rivedere i costi.'}",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    
    else:
        # PRO: 3 insights fissi
        prompts = [
            ("positivo", "Identifica UN punto positivo o un successo nei dati di oggi (max 2 frasi)."),
            ("rischio", "Identifica UN potenziale rischio o area di attenzione (max 2 frasi)."),
            ("azione", "Suggerisci UN'azione concreta che l'utente potrebbe fare domani (max 2 frasi).")
        ]
        
        for tipo, instruction in prompts:
            prompt = f"""{instruction}

{context}

Risposta in italiano, tono pratico e prudente. Non parlare di tasse o contabilità fiscale.
"""
            
            try:
                llm = LlmChat(
                    api_key=os.environ.get('EMERGENT_LLM_KEY'),
                    session_id=f"insight_{tipo}_{user.user_id}_{data}",
                    system_message="Sei un consulente aziendale esperto."
                )
                llm.with_model("openai", "gpt-5.2")
                
                user_message = UserMessage(text=prompt)
                response = await llm.send_message(user_message)
                
                insights.append({
                    "insight_id": f"ins_{uuid.uuid4().hex[:12]}",
                    "user_id": user.user_id,
                    "data": data,
                    "tipo": tipo,
                    "contenuto": response.strip(),
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
            except:
                pass
    
    # Save insights to database
    if insights:
        await db.insights_ai.insert_many([i.copy() for i in insights])
    
    return insights

# ============== NOTIFICHE ROUTES ==============

@api_router.get("/notifiche")
async def get_notifiche(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user notifications"""
    user = await get_current_user(request, session_token)
    
    notifiche = await db.notifiche.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return notifiche

@api_router.patch("/notifiche/{notifica_id}/letta")
async def mark_notifica_letta(request: Request, notifica_id: str, session_token: Optional[str] = Cookie(None)):
    """Mark notification as read"""
    user = await get_current_user(request, session_token)
    
    result = await db.notifiche.update_one(
        {"notifica_id": notifica_id, "user_id": user.user_id},
        {"$set": {"letta": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notifica non trovata")
    
    return {"message": "Notifica aggiornata"}

# ============== SUBSCRIPTION ROUTES ==============

@api_router.post("/subscription/upgrade")
async def upgrade_subscription(request: Request, session_token: Optional[str] = Cookie(None)):
    """Upgrade to PRO (Stripe integration placeholder)"""
    user = await get_current_user(request, session_token)
    
    # TODO: Integrate Stripe
    # For now, just upgrade directly
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"subscription_tier": "pro"}}
    )
    
    return {"message": "Upgrade a PRO completato", "tier": "pro"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()