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
        data = ai_service.load_data()
        return data["reviews"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-review", response_model=schemas.ReviewAnalysis)
async def analyze_review(review: schemas.ReviewInput):
    try:
        sentiment = ai_service.analyze_sentiment(review.content)
        suggested_responses = ai_service.generate_responses(
            review.content, sentiment, review.tone, review.business_type or "Restaurant"
        )
        return {"sentiment": sentiment, "suggested_responses": suggested_responses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Prompts ──────────────────────────────────────────────────────────────────

@app.get("/prompts", response_model=List[schemas.PromptTemplate])
async def get_prompts():
    try:
        data = ai_service.load_data()
        return data["prompts"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/prompts")
async def update_prompts(prompts: List[schemas.PromptTemplate]):
    try:
        data = ai_service.load_data()
        data["prompts"] = [p.dict() for p in prompts]
        ai_service.save_data(data)
        return {"message": "Prompts updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Trends ───────────────────────────────────────────────────────────────────

@app.get("/trends")
async def get_trends():
    try:
        data = ai_service.load_data()
        return ai_service.generate_trends(data["reviews"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── AI Search ────────────────────────────────────────────────────────────────

@app.post("/search")
async def search_reviews(request: schemas.SearchRequest):
    try:
        data = ai_service.load_data()
        results = ai_service.ai_search(request.query, data["reviews"], request.filters or {})
        return {"results": results, "total": len(results), "query": request.query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Real-Time Review Simulation ─────────────────────────────────────────────

@app.get("/realtime/review")
async def get_realtime_review():
    """Returns a simulated new review arriving in real-time"""
    try:
        return ai_service.get_simulated_realtime_review()
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
            new_review = ai_service.get_simulated_realtime_review()
            await manager.broadcast(json.dumps(new_review))
        except Exception as e:
            print(f"Simulation error: {e}")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(review_simulation_task())

# ─── Export ───────────────────────────────────────────────────────────────────

@app.get("/export")
async def export_reviews():
    try:
        data = ai_service.load_data()
        csv_content = ai_service.generate_csv_report(data["reviews"])
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
        data = ai_service.load_data()
        return data.get("business_profiles", [data.get("business_profile")]) if data.get("business_profiles") or data.get("business_profile") else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/profiles")
async def update_profiles(profiles: List[schemas.BusinessProfile]):
    try:
        data = ai_service.load_data()
        data["business_profiles"] = [p.dict() for p in profiles]
        # Keep business_profile for backward compatibility
        if profiles:
            data["business_profile"] = profiles[0].dict()
        ai_service.save_data(data)
        return {"message": "Profiles updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile", response_model=schemas.BusinessProfile)
async def get_profile():
    try:
        data = ai_service.load_data()
        profiles = data.get("business_profiles", [])
        if profiles:
            return profiles[0]
        return data.get("business_profile", {
            "id": "default", "name": "My Business", "type": "Restaurant", "address": "", "contact": "", "specialties": []
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/profile")
async def update_profile(profile: schemas.BusinessProfile):
    try:
        data = ai_service.load_data()
        data["business_profile"] = profile.dict()
        ai_service.save_data(data)
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Automation Rules ──────────────────────────────────────────────────────────

@app.get("/rules", response_model=List[schemas.AutomationRule])
async def get_rules():
    try:
        data = ai_service.load_data()
        return data.get("automation_rules", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rules")
async def update_rules(rules: List[schemas.AutomationRule]):
    try:
        data = ai_service.load_data()
        data["automation_rules"] = [r.dict() for r in rules]
        ai_service.save_data(data)
        return {"message": "Automation rules updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── System Configuration ──────────────────────────────────────────────────────

@app.get("/config/system", response_model=schemas.SystemConfig)
async def get_system_config():
    try:
        data = ai_service.load_data()
        return data.get("system_config", {"gemini_api_key": ""})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/config/system")
async def update_system_config(config: schemas.SystemConfig):
    try:
        data = ai_service.load_data()
        data["system_config"] = config.dict()
        ai_service.save_data(data)
        # Re-initialize the AI service with the new key immediately
        ai_service.initialize_ai()
        return {"message": "System configuration updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
