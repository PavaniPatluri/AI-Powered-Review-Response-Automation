import json
import asyncio
import os
from database import db

# Load local data
STORAGE_PATH = os.path.join(os.path.dirname(__file__), "storage.json")

def load_local_data():
    try:
        with open(STORAGE_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Local storage.json not found.")
        return None

async def migrate():
    print("🚀 Starting Migration to Supabase...")
    data = load_local_data()
    if not data:
        return

    # Check for credentials
    if not db.url or not os.getenv("SUPABASE_KEY"):
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in your .env file.")
        return

    # 1. Migrate Profiles
    print("📦 Migrating Profiles...")
    profiles = data.get("business_profiles", [])
    if not profiles and data.get("business_profile"):
        profiles = [data["business_profile"]]
    
    if profiles:
        res = await db.upsert("profiles", profiles)
        print(f"✅ Migrated {len(profiles)} profiles.")

    # 2. Migrate Prompts
    print("📦 Migrating Prompts...")
    prompts = data.get("prompts", [])
    if prompts:
        # Pydantic dicts might be nested, we just need the flat list for upsert
        res = await db.upsert("prompts", prompts)
        print(f"✅ Migrated {len(prompts)} prompts.")

    # 3. Migrate Rules
    print("📦 Migrating Rules...")
    rules = data.get("automation_rules", [])
    if rules:
        res = await db.upsert("rules", rules)
        print(f"✅ Migrated {len(rules)} rules.")

    # 4. Migrate Reviews
    print("📦 Migrating Reviews...")
    reviews = data.get("reviews", [])
    if reviews:
        # Reviews can be many, upsert in chunks if needed, but for now do all
        res = await db.upsert("reviews", reviews)
        print(f"✅ Migrated {len(reviews)} reviews.")

    # 5. Migrate Config
    print("📦 Migrating System Config...")
    config = data.get("system_config")
    if config:
        res = await db.upsert("config", [{"id": "main", "gemini_api_key": config.get("gemini_api_key")}])
        print("✅ Migrated system configuration.")

    print("\n🎉 Migration Complete! Your cloud database is now in sync.")

if __name__ == "__main__":
    asyncio.run(migrate())
