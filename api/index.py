import sys
import os

# Add the project root to the path so we can import from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from backend.main import app
except ImportError as e:
    print(f"Import Error in api/index.py: {e}")
    # Fallback for different Vercel directory structures
    try:
        from main import app
    except ImportError:
        raise e

# This is required for Vercel's Python runtime to find the FastAPI instance
handler = app
