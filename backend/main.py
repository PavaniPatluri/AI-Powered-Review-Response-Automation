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

# Clear signal of production stability
try:
    from backend import schemas
    from backend.services import ai_service
    from backend.database import db
except ImportError:
    # Local development fallback
    import schemas
    from services import ai_service
    from database import db

app = FastAPI(title="Review Catalyst AI Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Health & Status ─────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "AI Review Response Automation API v2.0 is running", "status": "healthy"}

@app.get("/api/status")
@app.get("/status")
async def status():
    try:
        from backend.database import settings
    except ImportError:
        from database import settings
        
    return {
        "status": "online",
        "supabase_url_set": bool(getattr(settings, 'supabase_url', '')),
        "supabase_key_set": bool(getattr(settings, 'supabase_key', '')),
        "gemini_api_key_set": bool(os.getenv("GEMINI_API_KEY")),
        "python_path": sys.path
    }

# ─── Reviews ─────────────────────────────────────────────────────────────────

@app.get("/reviews", response_model=List[schemas.Review])
@app.get("/api/reviews", response_model=List[schemas.Review])
async def get_reviews():
    try:
        reviews = await db.get_all("reviews")
        return reviews or []
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return []

@app.post("/reviews/{review_id}/respond")
@app.post("/api/reviews/{review_id}/respond")
async def draft_response(review_id: str, input_data: schemas.ReviewInput):
    # Fetch review
    review = await db.get_by_id("reviews", review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    # Generate response
    response = await ai_service.generate_response(review, input_data.tone)
    
    # Update review with draft
    await db.update("reviews", review_id, {
        "drafted_response": response,
        "ai_tone": input_data.tone,
        "status": "Drafted"
    })
    
    return {"id": review_id, "response": response}

@app.post("/reviews/{review_id}/publish")
@app.post("/api/reviews/{review_id}/publish")
async def publish_response(review_id: str):
    await db.update("reviews", review_id, {"status": "Published"})
    return {"status": "success"}

# ─── Trends & Insights ───────────────────────────────────────────────────────

@app.get("/trends")
@app.get("/api/trends")
async def get_trends():
    try:
        trends = await ai_service.generate_trends()
        return trends
    except Exception as e:
        print(f"Error generating trends: {e}")
        # Fallback trends
        return {
            "score": 0,
            "summary": "AI Intelligence core is initializing or missing configuration.",
            "strengths": ["System Standby"],
            "weaknesses": ["Data Ingestion Pending"]
        }

# ─── Knowledge & Search ──────────────────────────────────────────────────────

@app.post("/search", response_model=List[schemas.SearchResult])
@app.post("/api/search", response_model=List[schemas.SearchResult])
async def search_reviews(request: schemas.SearchRequest):
    return await ai_service.semantic_search(request.query)

# ─── Config & Automation ─────────────────────────────────────────────────────

@app.get("/prompts")
@app.get("/api/prompts")
async def get_prompts():
    return await db.get_all("prompts") or []

@app.get("/rules")
@app.get("/api/rules")
async def get_rules():
    return await db.get_all("automation_rules") or []

@app.get("/profile")
@app.get("/api/profile")
async def get_profile():
    profiles = await db.get_all("business_profiles")
    return profiles[0] if profiles else {}

@app.get("/export")
@app.get("/api/export")
async def export_reviews():
    reviews = await db.get_all("reviews")
    csv_content = ai_service.generate_csv_report(reviews or [])
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reviews_export.csv"}
    )

# ─── Real-time Intelligence Hub ──────────────────────────────────────────────

active_connections = set()

@app.websocket("/ws/live-reviews")
@app.websocket("/api/ws/live-reviews")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def review_simulation_task():
    """Simulates incoming reviews for demonstration purposes if enabled"""
    while True:
        try:
            # Random delay
            await asyncio.sleep(60) 
            # In a real app, this would poll an external API
        except Exception as e:
            print(f"Simulation error: {e}")
            await asyncio.sleep(10)

@app.on_event("startup")
async def startup_event():
    try:
        print("Initializing Intelligence Core...")
        # Check if we have the needed keys before spinning up the AI
        from backend.database import settings
        if settings.supabase_url and settings.supabase_key:
            await ai_service.initialize_ai()
            # Only start simulation if not on Vercel to save resources
            if not os.getenv("VERCEL"):
                asyncio.create_task(review_simulation_task())
            print("Backend services successfully started.")
        else:
            print("WARNING: Database credentials missing. Backend running in restricted mode.")
    except Exception as e:
        print(f"STARTUP ERROR: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
