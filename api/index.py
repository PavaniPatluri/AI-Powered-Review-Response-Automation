import json
import os
import sys
import traceback

def handler(request):
    """
    Pure Python handler for Vercel. 
    Does not require FastAPI or any other library.
    Used for 100% reliable error diagnostics.
    """
    try:
        # Add project root to path
        current_dir = os.path.dirname(__file__)
        project_root = os.path.abspath(os.path.join(current_dir, ".."))
        sys.path.insert(0, project_root)
        sys.path.insert(0, os.path.join(project_root, "backend"))
        
        # Diagnostics
        diagnostics = {
            "status": "DIAGNOSTIC_MODE",
            "cwd": os.getcwd(),
            "sys_path": sys.path,
            "api_dir_files": os.listdir(current_dir),
            "root_dir_files": os.listdir(project_root) if os.path.exists(project_root) else "NOT_FOUND",
            "error": "NONE"
        }
        
        # Try to import the app to see the REAL error
        try:
            from backend.main import app
            diagnostics["import_status"] = "SUCCESS"
            # If we reach here, we can actually try to run the app
            # but for now we just want to see if it works.
        except Exception as e:
            diagnostics["import_status"] = "FAILED"
            diagnostics["error"] = str(e)
            diagnostics["traceback"] = traceback.format_exc().split("\n")

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(diagnostics, indent=2)
        }
    except Exception as fatal_e:
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "text/plain"},
            "body": f"FATAL DIAGNOSTIC ERROR: {str(fatal_e)}\n{traceback.format_exc()}"
        }
