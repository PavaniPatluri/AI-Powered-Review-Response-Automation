import sys
import os

# Add the project root to the path
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

# Force the backend directory into the path as well
sys.path.insert(0, os.path.join(project_root, "backend"))

try:
    # On Vercel, we attempt to import the app from the backend.main module
    from backend.main import app
except ImportError:
    # Fallback for alternative directory structures
    try:
        from main import app
    except ImportError as e:
        print(f"CRITICAL: Failed to import FastAPI app. Path: {sys.path}")
        raise e

# Required for Vercel Python runtime
handler = app
