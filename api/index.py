import os
import sys

# Add project root and backend to path
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.insert(0, path)

# Import the FastAPI instance
from backend.main import app

# Explicitly expose for Vercel / ASGI runners
application = app
