from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ReviewInput(BaseModel):
    content: str
    tone: Optional[str] = "Professional"
    business_type: Optional[str] = "Restaurant"

class SuggestedResponse(BaseModel):
    tone: str
    content: str

class ReviewAnalysis(BaseModel):
    sentiment: str
    suggested_responses: List[SuggestedResponse]
    crisis_brief: Optional[str] = None

class PromptExample(BaseModel):
    review: str
    response: str

class PromptTemplate(BaseModel):
    tone: str
    system_prompt: str
    examples: Optional[List[PromptExample]] = []

class Review(BaseModel):
    id: str
    author: str
    rating: int
    content: str
    date: str
    source: str
    sentiment: Optional[str] = "Neutral"
    status: Optional[str] = "Pending"
    business_type: Optional[str] = "Restaurant"
    platform: Optional[str] = "Google"
    drafted_response: Optional[str] = None
    ai_tone: Optional[str] = None
    language: Optional[str] = "English"
    language_code: Optional[str] = "en"
    categories: Optional[List[str]] = []
    profile_id: Optional[str] = "default"

class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = {}

class SearchResult(BaseModel):
    review_id: str
    author: str
    content: str
    rating: int
    sentiment: str
    business_type: str
    relevance_score: float
    ai_summary: Optional[str] = ""

class AutomationRule(BaseModel):
    id: str
    name: str
    rating_min: int
    tone: str
    enabled: bool = True
    sentiment_match: Optional[List[str]] = []
    keyword_match: Optional[List[str]] = []
    category_match: Optional[List[str]] = []

class BusinessProfile(BaseModel):
    id: str
    name: str
    type: str
    address: Optional[str] = ""
    contact: Optional[str] = ""
    specialties: Optional[List[str]] = []
    tone: Optional[str] = "Professional"
    auto_respond: Optional[bool] = False

class RealtimeReview(BaseModel):
    id: str
    author: str
    rating: int
    content: str
    date: str
    source: str
    sentiment: str
    business_type: str
    platform: str
    is_new: Optional[bool] = True
    drafted_response: Optional[str] = None
    ai_tone: Optional[str] = None
    language: Optional[str] = "English"
    language_code: Optional[str] = "en"
    categories: Optional[List[str]] = []
    profile_id: Optional[str] = "default"

class SystemConfig(BaseModel):
    gemini_api_key: Optional[str] = ""
