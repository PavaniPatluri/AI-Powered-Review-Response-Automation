import os
import json
import httpx
from typing import List, Dict, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")
    
    class Config:
        env_file = ".env"

settings = Settings()

class DatabaseBridge:
    def __init__(self):
        self.url = settings.supabase_url
        self.headers = {
            "apikey": settings.supabase_key,
            "Authorization": f"Bearer {settings.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    async def _request(self, method: str, table: str, query: str = "", data: Optional[Dict] = None):
        if not self.url or not settings.supabase_key:
            return None
            
        full_url = f"{self.url}/rest/v1/{table}{query}"
        async with httpx.AsyncClient() as client:
            try:
                if method == "GET":
                    resp = await client.get(full_url, headers=self.headers)
                elif method == "POST":
                    resp = await client.post(full_url, headers=self.headers, json=data)
                elif method == "PATCH":
                    resp = await client.patch(full_url, headers=self.headers, json=data)
                elif method == "DELETE":
                    resp = await client.delete(full_url, headers=self.headers)
                
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                print(f"Supabase Error [{method} {table}]: {e}")
                return None

    # --- Tables ---
    
    async def get_all(self, table: str):
        return await self._request("GET", table, "?select=*")

    async def get_by_id(self, table: str, id_val: str):
        res = await self._request("GET", table, f"?id=eq.{id_val}&select=*")
        return res[0] if res else None

    async def upsert(self, table: str, data: List[Dict]):
        # PostgREST upsert uses POST with a header
        headers = self.headers.copy()
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.url}/rest/v1/{table}", headers=headers, json=data)
            return resp.json()

    async def update(self, table: str, id_val: str, data: Dict):
        return await self._request("PATCH", table, f"?id=eq.{id_val}", data)

db = DatabaseBridge()
