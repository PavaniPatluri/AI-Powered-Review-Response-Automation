from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List
import asyncio
import random
import json
import io
import schemas
from services import ai_service
from services.database import db

app = FastAPI(title="Review Catalyst AI Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "AI Review Response Automation API v2.0 is running", "status": "healthy"}

# ─── Reviews ─────────────────────────────────────────────────────────────────

@app.get("/reviews", response_model=List[schemas.Review])
async def get_reviews():
    try:
        reviews = await db.get_all("reviews")
        return reviews or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-review", response_model=schemas.ReviewAnalysis)
async def analyze_review(review: schemas.ReviewInput):
    try:
        sentiment = ai_service.analyze_sentiment(review.content)
        suggested_responses = await ai_service.generate_responses(
            review.content, sentiment, review.tone, review.business_type or "Restaurant"
        )
        return {"sentiment": sentiment, "suggested_responses": suggested_responses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Prompts ──────────────────────────────────────────────────────────────────

@app.get("/prompts", response_model=List[schemas.PromptTemplate])
async def get_prompts():
    try:
        prompts = await db.get_all("prompts")
        return prompts or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/prompts")
async def update_prompts(prompts: List[schemas.PromptTemplate]):
    try:
        data = [p.dict() for p in prompts]
        await db.upsert("prompts", data)
        return {"message": "Prompts updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Trends ───────────────────────────────────────────────────────────────────

@app.get("/trends")
async def get_trends():
    try:
        reviews = await db.get_all("reviews")
        return ai_service.generate_trends(reviews or [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── AI Search ────────────────────────────────────────────────────────────────

@app.post("/search")
async def search_reviews(request: schemas.SearchRequest):
    try:
        reviews = await db.get_all("reviews")
        results = ai_service.ai_search(request.query, reviews or [], request.filters or {})
        return {"results": results, "total": len(results), "query": request.query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Real-Time Review Simulation ─────────────────────────────────────────────

@app.get("/realtime/review")
async def get_realtime_review():
    """Returns a simulated new review arriving in real-time"""
    try:
        return await ai_service.get_simulated_realtime_review()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── WebSocket for Live Feed ──────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws/live-reviews")
async def websocket_live_reviews(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ─── Background Simulation ────────────────────────────────────────────────────

async def review_simulation_task():
    """Generates and broadcasts a new review every 45-60 seconds"""
    while True:
        await asyncio.sleep(random.randint(45, 60))
        try:
            new_review = await ai_service.get_simulated_realtime_review()
            await manager.broadcast(json.dumps(new_review))
        except Exception as e:
            print(f"Simulation error: {e}")

@app.on_event("startup")
async def startup_event():
    try:
        print("Initializing Intelligence Core...")
        await ai_service.initialize_ai()
        asyncio.create_task(review_simulation_task())
        print("Backend services successfully started.")
    except Exception as e:
        print(f"CRITICAL STARTUP ERROR: {e}")
        # We don't re-raise here to allow the FastAPI app to at least serve the root/health endpoints
        # This helps in debugging 500 errors on Vercel

# ─── Export ───────────────────────────────────────────────────────────────────

@app.get("/export")
async def export_reviews():
    try:
        reviews = await db.get_all("reviews")
        csv_content = ai_service.generate_csv_report(reviews or [])
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=review_report.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Business Profiles (Multi-Location) ───────────────────────────────────────

@app.get("/profiles", response_model=List[schemas.BusinessProfile])
async def get_profiles():
    try:
        profiles = await db.get_all("profiles")
        return profiles or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/profiles")
async def update_profiles(profiles: List[schemas.BusinessProfile]):
    try:
        data = [p.dict() for p in profiles]
        await db.upsert("profiles", data)
        return {"message": "Profiles updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile", response_model=schemas.BusinessProfile)
async def get_profile():
    try:
        profiles = await db.get_all("profiles")
        if profiles:
            return profiles[0]
        return {
            "id": "default", "name": "My Business", "type": "Restaurant", "address": "", "contact": "", "specialties": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/profile")
async def update_profile(profile: schemas.BusinessProfile):
    try:
        await db.upsert("profiles", [profile.dict()])
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Automation Rules ──────────────────────────────────────────────────────────

@app.get("/rules", response_model=List[schemas.AutomationRule])
async def get_rules():
    try:
        rules = await db.get_all("rules")
        return rules or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rules")
async def update_rules(rules: List[schemas.AutomationRule]):
    try:
        data = [r.dict() for r in rules]
        await db.upsert("rules", data)
        return {"message": "Automation rules updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── System Configuration ──────────────────────────────────────────────────────

@app.get("/config/system", response_model=schemas.SystemConfig)
async def get_system_config():
    try:
        config = await ai_service.get_config()
        return config or {"gemini_api_key": ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/config/system")
async def update_system_config(config: schemas.SystemConfig):
    try:
        await db.upsert("config", [{"id": "main", "gemini_api_key": config.gemini_api_key}])
        # Re-initialize the AI service with the new key immediately
        await ai_service.initialize_ai()
        return {"message": "System configuration updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
