import sys
import os

# Add project root to path so 'backend' module can be imported
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "backend"))

# Import the FastAPI app
try:
    from backend.main import app
except ImportError:
    # Fallback to local import if backend dir is missing its parent
    from main import app

# This is the entry point for Vercel's @vercel/python builder
# Vercel handles ASGI apps (FastAPI) automatically if 'app' is exposed.
