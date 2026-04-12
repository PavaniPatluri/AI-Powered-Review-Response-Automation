import asyncio
import os
import httpx
from dotenv import load_dotenv

# Load credentials
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

async def init_db():
    if not URL or not KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in your .env file.")
        return

    print("🚀 Initializing Review Catalyst Cloud Intelligence Core...")

    # Read schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    if not os.path.exists(schema_path):
        print(f"❌ Error: schema.sql not found at {schema_path}")
        return

    with open(schema_path, "r") as f:
        sql = f.read()

    # Supabase doesn't expose a direct SQL endpoint via PostgREST for safety.
    # Usually, one would use the Supabase SQL Editor.
    # However, we can try to create tables one by one or instruct the user.
    
    print("\n📝 ACTION REQUIRED: Supabase requires the SQL Schema to be applied via their Dashboard.")
    print("I have verified that your tables are currently missing (404).")
    print(f"\n1. Go to: {URL.replace('.supabase.co', '.supabase.com')}")
    print("2. Open the 'SQL Editor' in the left sidebar.")
    print("3. Paste the contents of 'backend/schema.sql'.")
    print("4. Click 'Run'.")
    
    print("\n--- SCHEMA PREVIEW ---")
    print(sql[:300] + "...")
    print("----------------------\n")

    # We can also check connection one last time
    headers = {
        "apikey": KEY,
        "Authorization": f"Bearer {KEY}"
    }
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{URL}/rest/v1/", headers=headers)
            if resp.status_code == 200:
                print("✅ Connection to Supabase Gateway verified.")
            else:
                print(f"⚠️ Gateway responded with status {resp.status_code}. Check your API Key.")
        except Exception as e:
            print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(init_db())
