import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from backend.database import db

async def test():
    print("Testing DB connection...")
    tables = ["profiles", "rules", "prompts", "config"]
    for t in tables:
        res = await db.get_all(t)
        print(f"Table {t} GET: {res}")
    
    print("\nTesting Profiles Write...")
    test_data = [
        {
            "id": "test_loc_123",
            "name": "The Royal Spice (Test Copy)",
            "type": "Restaurant",
            "address": "123 Test St",
            "tone": "Professional"
        }
    ]
    res = await db.upsert("profiles", test_data)
    print(f"Upsert Result: {res}")
    
    # Check if saved
    res = await db.get_all("profiles")
    print(f"Profiles after save: {res}")

if __name__ == "__main__":
    asyncio.run(test())
