import sys
import os
import traceback
from fastapi import FastAPI

# Add the project root to the path
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "backend"))

try:
    from backend.main import app
    handler = app
except Exception as e:
    # EMERGENCY TRACEBACK ECHO
    # If the app fails to start, we create a temporary FastAPI app 
    # that will show us the EXACT error in the browser.
    error_app = FastAPI()
    error_trace = traceback.format_exc()
    
    @error_app.get("/{full_path:path}")
    async def echo_error(full_path: str):
        return {
            "status": "CRITICAL_FAILURE",
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": error_trace.split("\n"),
            "sys_path": sys.path,
            "cwd": os.getcwd()
        }
    
    handler = error_app
