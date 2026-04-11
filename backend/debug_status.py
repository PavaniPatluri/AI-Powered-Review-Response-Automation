from fastapi import FastAPI
import os
import sys

app = FastAPI()

@app.get("/api/status")
async def status():
    return {
        "status": "online",
        "diagnostic_mode": True,
        "python_version": sys.version,
        "working_directory": os.getcwd(),
        "files_in_cwd": os.listdir(os.getcwd()) if os.path.exists(os.getcwd()) else [],
        "env_vars": {
            "SUPABASE_URL_SET": bool(os.getenv("SUPABASE_URL")),
            "SUPABASE_KEY_SET": bool(os.getenv("SUPABASE_KEY")),
            "GEMINI_API_KEY_SET": bool(os.getenv("GEMINI_API_KEY")),
            "PORT": os.getenv("PORT")
        }
    }

@app.get("/api")
async def api_root():
    return {"message": "Diagnostic API Root"}

@app.get("/")
async def root():
    return {"message": "Diagnostic Global Root"}
