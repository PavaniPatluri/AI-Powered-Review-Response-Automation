import sys
import os
import asyncio
import random
import json
import io
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List

# ─── Robust Imports ──────────────────────────────────────────────────────────
try:
    from backend import schemas
    from backend.services import ai_service, auth_service
    from backend.database import db, settings
except ImportError:
    import schemas
    from services import ai_service, auth_service
    from database import db, settings

auth_engine = auth_service.AuthService(db)

app = FastAPI(title="Review Catalyst AI Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Hardcoded Fallback Data ──────────────────────────────────────────────────
# This ensures that even if Supabase is offline, the dashboard is beautiful.
FALLBACK_REVIEWS = [
    {
        "id": f"fb-{i}",
        "author": name,
        "rating": random.randint(4, 5) if i % 2 == 0 else random.randint(1, 3),
        "sentiment": "Positive" if i % 2 == 0 else "Negative",
        "content": "This is a high-priority Intelligence core simulation. If you are seeing this, the backend is successfully online and ready for cloud key synchronization.",
        "date": "2026-04-12",
        "business_type": btype,
        "platform": "Google",
        "source": "Simulation",
        "status": "Published" if i < 2 else "Pending"
    }
    for i, (name, btype) in enumerate(zip(
        ["James Miller", "Sarah Chen", "Elena Rodriguez", "David Kim", "Marcus Thorne", "Tanya Gupta"],
        ["Restaurant", "Hotel", "Clinic", "Salon", "Theater", "Restaurant"]
    ))
]

FALLBACK_PROMPTS = [
    {
        "tone": "Professional",
        "system_prompt": "You are a professional customer success manager. Provide formal, polite, and structured responses. Acknowledge feedback, thank them, and outline action steps if needed.",
        "examples": [{"review": "Great service.", "response": "Thank you for your feedback! We are glad you enjoyed our service."}]
    },
    {
        "tone": "Friendly",
        "system_prompt": "You are a warm and friendly business owner. Use a casual, welcoming tone. Make customers feel like family.",
        "examples": [{"review": "Loved the vibe!", "response": "We're so happy you had a blast! Thanks for visiting us!"}]
    },
    {
        "tone": "Empathetic",
        "system_prompt": "You are a caring support agent. Validate feelings, offer sincere apologies and show you care.",
        "examples": [{"review": "It was too loud.", "response": "We sincerely apologize for the noise. We want you to have a relaxing time and will look into this."}]
    },
    {
        "tone": "Apologetic",
        "system_prompt": "You are a humble business representative. Lead with a sincere apology and offer a clear resolution path.",
        "examples": [{"review": "Order was wrong.", "response": "We are truly sorry for the mistake. Please contact us so we can make it right immediately."}]
    },
    {
        "tone": "Celebratory",
        "system_prompt": "You are an excited business owner. Express pure joy and gratitude for 5-star reviews.",
        "examples": [{"review": "Best ever!", "response": "Wow! Thank you so much! We are thrilled you had such a great experience!"}]
    }
]

FALLBACK_RULES = [
    {
        "id": 1,
        "name": "5-Star Excellence",
        "enabled": True,
        "rating_min": 5,
        "sentiment_match": ["Positive"],
        "tone": "Celebratory"
    },
    {
        "id": 2,
        "name": "Negative Recovery",
        "enabled": True,
        "rating_min": 1,
        "sentiment_match": ["Negative"],
        "tone": "Apologetic"
    }
]

FALLBACK_PROFILES = [
    {
        "id": "default",
        "name": "The Royal Spice",
        "type": "Restaurant",
        "address": "123 Gourmet St, Foodville",
        "contact": "+1 (555) 123-4567",
        "specialties": ["Butter Chicken", "Peshawari Naan"],
        "tone": "Professional",
        "auto_respond": True
    }
]

# ─── Health & Status ─────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "AI Review Response Automation API v2.0 is running", "status": "healthy"}

@app.get("/api/status")
@app.get("/status")
async def status():
    # Diagnostics X-Ray
    env_keys = os.environ.keys()
    supabase_keys = [k for k in env_keys if "SUPABASE" in k.upper()]
    
    return {
        "status": "online",
        "supabase_url_set": bool(settings.supabase_url),
        "supabase_key_set": bool(settings.supabase_key),
        "gemini_api_key_set": bool(os.getenv("GEMINI_API_KEY")),
        "x_ray_keys": supabase_keys,
        "mode": "CLOUD" if settings.supabase_url else "LOCAL_FALLBACK"
    }

# ─── Reviews ─────────────────────────────────────────────────────────────────

@app.get("/reviews", response_model=List[schemas.Review])
@app.get("/api/reviews", response_model=List[schemas.Review])
async def get_reviews():
    try:
        # Try cloud first
        reviews = await db.get_all("reviews")
        if reviews and len(reviews) > 0:
            return reviews
        return FALLBACK_REVIEWS
    except Exception as e:
        print(f"Cloud fetch failed, using fallback: {e}")
        return FALLBACK_REVIEWS

@app.post("/reviews/{review_id}/respond")
@app.post("/api/reviews/{review_id}/respond")
async def draft_response(review_id: str, input_data: schemas.ReviewInput):
    try:
        review = await db.get_by_id("reviews", review_id)
        if not review:
            # Check fallback data
            review = next((r for r in FALLBACK_REVIEWS if r["id"] == review_id), None)
            
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
            
        response = await ai_service.generate_response(review, input_data.tone)
        return {"id": review_id, "response": response}
    except Exception as e:
        return {"id": review_id, "response": f"AI Engine is initializing. Root cause: {e}"}

@app.post("/analyze-review")
@app.post("/api/analyze-review")
async def analyze_review_endpoint(request: schemas.ReviewAnalysisRequest):
    try:
        data = await ai_service.analyze_single_review(request.content, request.tone, request.business_type)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Trends ──────────────────────────────────────────────────────────────────

@app.get("/trends")
@app.get("/api/trends")
async def get_trends():
    try:
        return await ai_service.generate_trends()
    except:
        return {
            "score": 85,
            "summary": "Neural Strategic Intelligence is running in high-fidelity simulation mode.",
            "strengths": ["System Resilience", "Diagnostic Core Active"],
            "weaknesses": ["Manual Sync Required"]
        }

@app.get("/prompts")
@app.get("/api/prompts")
async def get_prompts():
    try:
        prompts = await db.get_all("prompts")
        if prompts and len(prompts) > 0:
            return prompts
        return FALLBACK_PROMPTS
    except Exception as e:
        print(f"Prompt fetch failed: {e}")
        return FALLBACK_PROMPTS

@app.get("/rules")
@app.get("/api/rules")
async def get_rules():
    try:
        rules = await db.get_all("rules")
        if rules and len(rules) > 0:
            return rules
        return FALLBACK_RULES
    except Exception as e:
        print(f"Rules fetch failed: {e}")
        return FALLBACK_RULES

@app.get("/profile")
@app.get("/api/profile")
async def get_profile():
    return FALLBACK_PROFILES[0]

@app.get("/profiles")
@app.get("/api/profiles")
async def get_profiles():
    try:
        profiles = await db.get_all("profiles")
        if profiles and len(profiles) > 0:
            return profiles
        return FALLBACK_PROFILES
    except Exception as e:
        print(f"Profiles fetch failed: {e}")
        return FALLBACK_PROFILES

@app.get("/config/system")
@app.get("/api/config/system")
async def get_system_config():
    try:
        config = await db.get_by_id("config", "main")
        if config:
            return config
        return {"gemini_api_key": os.getenv("GEMINI_API_KEY", "")}
    except:
        return {"gemini_api_key": os.getenv("GEMINI_API_KEY", "")}

@app.post("/config/system")
@app.post("/api/config/system")
async def update_system_config(config: dict):
    try:
        res = await db.upsert("config", [{"id": "main", **config}])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/profiles")
@app.post("/api/profiles")
async def update_profiles(profiles: List[dict]):
    try:
        res = await db.upsert("profiles", profiles)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rules")
@app.post("/api/rules")
async def update_rules(rules: List[dict]):
    try:
        res = await db.upsert("rules", rules)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/prompts")
@app.post("/api/prompts")
async def update_prompts(prompts: List[dict]):
    try:
        res = await db.upsert("prompts", prompts)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Authentication ──────────────────────────────────────────────────────────

@app.post("/api/auth/register/options", response_model=schemas.AuthOptionsResponse)
async def get_registration_options(request: schemas.AuthOptionsRequest):
    try:
        options, session_id = await auth_engine.get_registration_options(request.email)
        return {"options": json.loads(options), "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/register/verify")
async def verify_registration(data: schemas.RegistrationVerification):
    try:
        success = await auth_engine.verify_registration(data.email, data.registration_response, data.session_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login/options", response_model=schemas.AuthOptionsResponse)
async def get_login_options(request: schemas.AuthOptionsRequest):
    try:
        options, session_id = await auth_engine.get_login_options(request.email)
        return {"options": json.loads(options), "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login/verify", response_model=schemas.LoginResponse)
async def verify_login(data: schemas.AuthenticationVerification):
    try:
        token, user = await auth_engine.verify_login(data.email, data.auth_response, data.session_id)
        return {"success": True, "token": token, "user": user}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ─── Real-time ───────────────────────────────────────────────────────────────

@app.websocket("/ws/live-reviews")
@app.websocket("/api/ws/live-reviews")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass

@app.on_event("startup")
async def startup_event():
    try:
        print("Initializing Intelligence Core...")
        if settings.supabase_url:
            await ai_service.initialize_ai()
        print("Backend services successfully started.")
    except Exception as e:
        print(f"Startup warning: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
