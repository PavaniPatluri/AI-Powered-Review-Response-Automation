import asyncio
import os
from dotenv import load_dotenv
import httpx

# Load env from backend/.env
env_path = os.path.join("backend", ".env")
load_dotenv(env_path)

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

async def check_db():
    if not URL or not KEY:
        print("Error: Missing credentials")
        return

    headers = {
        "apikey": KEY,
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        for table in ["prompts", "reviews", "rules", "profiles"]:
            try:
                resp = await client.get(f"{URL}/rest/v1/{table}?select=*", headers=headers)
                print(f"Table: {table} | Status: {resp.status_code}")
                if resp.status_code == 200:
                    print(f" - Found {len(resp.json())} rows.")
                else:
                    print(f" - Error: {resp.text}")
            except Exception as e:
                print(f" - Request failed for {table}: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
