import json
import os
import random
import string
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

STORAGE_PATH = os.path.join(os.path.dirname(__file__), "..", "storage.json")
model = None

# ─── Data helpers ────────────────────────────────────────────────────────────

def load_data():
    try:
        with open(STORAGE_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"prompts": [], "reviews": []}

def save_data(data):
    with open(STORAGE_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def initialize_ai():
    global model
    data = load_data()
    system_config = data.get("system_config", {})
    api_key = system_config.get("gemini_api_key") or os.getenv("GEMINI_API_KEY")
    
    if api_key:
        try:
            from google import genai as google_genai
            _client = google_genai.Client(api_key=api_key)
            class _ModelWrapper:
                def generate_content(self, prompt):
                    resp = _client.models.generate_content(
                        model='gemini-1.5-flash', contents=prompt
                    )
                    class _R:
                        text = resp.text
                    return _R()
            model = _ModelWrapper()
            print("Gemini AI successfully initialized.")
        except Exception as _e:
            print(f"Warning: Could not initialize Gemini: {_e}")
            model = None
    else:
        model = None
        print("Running in AI Simulation Mode. Add Gemini API key in settings.")

# Initialize at startup
initialize_ai()

# ─── Comprehensive Review Analysis ───────────────────────────────────────────

def analyze_review_completely(content: str) -> Dict:
    """Detects sentiment, language, and smart categories in one AI pass"""
    if not model:
        # Fallback logic
        sentiment = "Neutral"
        positive_keywords = ["amazing", "good", "great", "excellent", "love", "perfect"]
        negative_keywords = ["bad", "slow", "worst", "unhappy", "poor", "terrible"]
        content_lower = content.lower()
        if any(w in content_lower for w in positive_keywords): sentiment = "Positive"
        if any(w in content_lower for w in negative_keywords): sentiment = "Negative"
        
        return {
            "sentiment": sentiment,
            "language": "English",
            "language_code": "en",
            "categories": ["General"]
        }

    try:
        prompt = f"""
        Analyze this customer review and return a JSON object:
        Review: "{content}"

        Fields:
        - "sentiment": One of [Positive, Negative, Neutral]
        - "language": Full language name (e.g. English, Spanish, French)
        - "language_code": 2-letter ISO code
        - "categories": List of 1-3 specific tags (e.g. Service, Food, Wait Time, Hygiene, Price, Atmosphere)

        Return ONLY valid JSON.
        """
        response = model.generate_content(prompt)
        # Handle some cleaning of the response
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(clean_text)
        return {
            "sentiment": data.get("sentiment", "Neutral"),
            "language": data.get("language", "English"),
            "language_code": data.get("language_code", "en"),
            "categories": data.get("categories", ["General"])
        }
    except Exception as e:
        print(f"Analysis error: {e}")
        return {"sentiment": "Neutral", "language": "English", "language_code": "en", "categories": ["General"]}

def analyze_sentiment(content: str) -> str:
    """Legacy helper, now uses comprehensive analysis"""
    return analyze_review_completely(content)["sentiment"]

# ─── Response Generation ──────────────────────────────────────────────────────

def generate_responses(content: str, sentiment: str, preferred_tone: str = "Professional",
                       business_type: str = "Restaurant") -> List[Dict]:
    data = load_data()
    profile = data.get("business_profile", {})
    
    # Find matching prompt template
    prompt_template = next((p for p in data["prompts"] if p["tone"] == preferred_tone), None)
    if not prompt_template:
        prompt_template = next((p for p in data["prompts"] if p["tone"] == "Professional"), {"system_prompt": "You are a helpful business owner.", "examples": []})
    
    system_prompt = prompt_template["system_prompt"]
    examples = prompt_template.get("examples", [])

    if not model:
        # Contextual fallback responses per business type
        fallbacks = {
            "Restaurant": f"Thank you so much for visiting {profile.get('name', 'us')}! We truly appreciate your feedback and look forward to welcoming you back soon.",
            "Hotel": f"Thank you for staying with us at {profile.get('name', 'our property')} and sharing your experience. Your comfort is our highest priority, and we hope to host you again.",
            "Clinic": f"Thank you for trusting {profile.get('name', 'our clinic')} with your health. Your feedback helps us improve our care. Please don't hesitate to reach out.",
            "Salon": f"Thank you for choosing {profile.get('name', 'our salon')}! Your satisfaction means everything to us. We can't wait to see you again!",
            "Theater": f"Thank you for being part of our audience at {profile.get('name', 'our theater')}! We're thrilled to create memorable experiences and hope to see you at our next show."
        }
        return [{"tone": preferred_tone, "content": fallbacks.get(business_type, fallbacks["Restaurant"])}]

    try:
        # Build few-shot examples string
        examples_str = ""
        for ex in examples[:2]: # Use up to 2 examples
            examples_str += f"Review: {ex['review']}\nResponse: {ex['response']}\n\n"

        # Build business context
        business_context = f"Business Name: {profile.get('name', '')}\n"
        if profile.get('address'): business_context += f"Address: {profile['address']}\n"
        if profile.get('specialties'): business_context += f"Specialties: {', '.join(profile['specialties'])}\n"

        # Detect language to instruct Gemini
        # (Usually we already have it, but for standalone calls we might need it)
        # For simplicity, we assume we want to respond in the review's language
        
        full_prompt = (
            f"{system_prompt}\n\n"
            f"--- BUSINESS CONTEXT ---\n"
            f"{business_context}\n"
            f"--- EXAMPLES ---\n"
            f"{examples_str}"
            f"--- NEW REVIEW ---\n"
            f"Customer Review: {content}\n"
            f"Detected Sentiment: {sentiment}\n\n"
            f"INSTRUCTIONS:\n"
            f"- Write a concise, {preferred_tone.lower()} response (3-4 sentences max).\n"
            f"- Address their specific points.\n"
            f"- IMPORTANT: Respond in the SAME LANGUAGE as the customer review.\n"
            f"- Do not use placeholder text. Be genuine."
        )
        response = model.generate_content(full_prompt)
        return [{"tone": preferred_tone, "content": response.text.strip()}]
    except Exception as e:
        return [{"tone": preferred_tone, "content": f"Thank you for your feedback! We appreciate you taking the time to share your experience with us."}]

# ─── Trends & Insights ────────────────────────────────────────────────────────

def generate_trends(reviews: List[Dict]) -> Dict:
    if not model or not reviews:
        return {
            "summary": "Your business is performing well across most review metrics. Connect your Gemini API key for deep AI-powered insights.",
            "strengths": ["Customer Service Quality", "Product/Service Excellence", "Value for Money"],
            "weaknesses": ["Peak Hour Management", "Communication & Follow-up", "Wait Time Optimization"],
            "score": 78,
            "response_rate": 42
        }

    reviews_text = "\n".join([f"- Rating: {r['rating']}/5, Type: {r.get('business_type','')}, Review: {r['content']}" for r in reviews[:20]])
    prompt = f"""
    Analyze these customer reviews and return a JSON object with:
    - "summary": A 2-sentence high-level strategic overview of business performance.
    - "strengths": Top 3 positive recurring themes (list of strings, max 4 words each).
    - "weaknesses": Top 3 specific areas needing improvement (list of strings, max 4 words each).
    - "score": A neural performance score 0-100 (integer) based on sentiment and quantity.
    - "response_rate": Calculated % of reviews that received or need a response (integer).

    REVIEWS DATA:
    {reviews_text}

    IMPORTANT: 
    - Be critical and analytical.
    - If there are fewer than 3 strengths or weaknesses, provide only what exists.
    - Return ONLY valid JSON. No markdown blocks.
    """
    try:
        response = model.generate_content(prompt)
        clean = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean)
    except Exception:
        return {
            "summary": "Unable to generate AI insights at this time.",
            "strengths": ["Service Quality", "Product Offerings"],
            "weaknesses": ["Response Time", "Communication"],
            "score": 70,
            "response_rate": 60
        }

# ─── AI Search Engine ─────────────────────────────────────────────────────────

def ai_search(query: str, reviews: List[Dict], filters: Dict = {}) -> List[Dict]:
    """Semantic AI-powered search through reviews"""
    results = []
    query_lower = query.lower()
    query_words = set(query_lower.split())

    for review in reviews:
        content_lower = review.get("content", "").lower()
        author_lower = review.get("author", "").lower()
        business_type = review.get("business_type", "")

        # Apply filters
        if filters.get("business_type") and business_type != filters["business_type"]:
            continue
        if filters.get("sentiment") and review.get("sentiment") != filters["sentiment"]:
            continue
        if filters.get("rating") and review.get("rating") != int(filters["rating"]):
            continue

        # Score calculation
        score = 0.0
        content_words = set(content_lower.split())

        # Keyword match scoring
        matched_words = query_words & content_words
        score += len(matched_words) * 0.3

        # Phrase match
        if query_lower in content_lower:
            score += 0.5
        if query_lower in author_lower:
            score += 0.2

        # Sentiment keyword matching
        if any(w in query_lower for w in ["positive", "happy", "good", "great"]) and review.get("sentiment") == "Positive":
            score += 0.3
        if any(w in query_lower for w in ["negative", "bad", "complaint", "issue"]) and review.get("sentiment") == "Negative":
            score += 0.3

        # Business type keyword matching
        if business_type.lower() in query_lower:
            score += 0.4

        if score > 0 or not query:
            ai_summary = ""
            if model and score > 0:
                try:
                    s_prompt = f"In one sentence, explain why this review is relevant to the query '{query}': '{review['content'][:150]}'"
                    s_resp = model.generate_content(s_prompt)
                    ai_summary = s_resp.text.strip()
                except:
                    ai_summary = f"Related to: {query}"
            elif score > 0:
                ai_summary = f"Matches your search for '{query}'"

            results.append({
                "review_id": review["id"],
                "author": review.get("author", ""),
                "content": review.get("content", ""),
                "rating": review.get("rating", 0),
                "sentiment": review.get("sentiment", "Neutral"),
                "business_type": business_type,
                "date": review.get("date", ""),
                "relevance_score": round(min(score, 1.0), 2),
                "ai_summary": ai_summary
            })

    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return results[:10]

# ─── Automation Engine ────────────────────────────────────────────────────────

def apply_automation_rules(review: Dict, rules: List[Dict]) -> Dict:
    """Matches rules against a review and generates a draft response if rule matches"""
    # Sort rules by rating_min descending to catch the highest matching rule first
    sorted_rules = sorted([r for r in rules if r.get("enabled", True)], 
                         key=lambda x: x.get("rating_min", 0), reverse=True)
    
    review_content_lower = review["content"].lower()
    
    for rule in sorted_rules:
        # 1. Rating Match
        if review["rating"] < rule.get("rating_min", 0):
            continue
            
        # 2. Sentiment Match (Optional)
        if rule.get("sentiment_match") and review.get("sentiment") not in rule["sentiment_match"]:
            continue
            
        # 3. Keyword Match (Negation / Mandatory)
        # If keywords start with '!', it means 'Must NOT contain'
        keywords = rule.get("keyword_match", [])
        should_skip = False
        for kw in keywords:
            kw_clean = kw.lower()
            if kw_clean.startswith("!"):
                if kw_clean[1:] in review_content_lower:
                    should_skip = True
                    break
            else:
                if kw_clean not in review_content_lower:
                    should_skip = True
                    break
        if should_skip: continue

        # 4. Category Match (Optional)
        if rule.get("category_match"):
            rev_cats = [c.lower() for c in review.get("categories", [])]
            rule_cats = [c.lower() for c in rule["category_match"]]
            if not any(c in rev_cats for c in rule_cats):
                continue

        # If we reached here, rule matched
        tone = rule.get("tone", "Professional")
        sentiment = review.get("sentiment", "Neutral")
        b_type = review.get("business_type", "Restaurant")
        
        responses = generate_responses(review["content"], sentiment, tone, b_type)
        if responses:
            review["drafted_response"] = responses[0]["content"]
            review["ai_tone"] = tone
            review["matched_rule"] = rule["name"]
            break
            
    return review

# ─── Real-time Review Simulation ─────────────────────────────────────────────

REALTIME_REVIEW_POOL = [
    {"author": "Ravi Kumar", "rating": 5, "content": "Just had the most amazing experience! Absolutely loved every moment.", "business_type": "Restaurant", "platform": "Google"},
    {"author": "Sophie Chen", "rating": 1, "content": "Extremely disappointed. Staff was unprofessional and dismissive.", "business_type": "Hotel", "platform": "TripAdvisor"},
    {"author": "Amir Khan", "rating": 4, "content": "Great service overall. Minor issues with parking but everything else was excellent.", "business_type": "Clinic", "platform": "Google"},
    {"author": "Emily Davis", "rating": 5, "content": "My stylist absolutely nailed the look! Salon is pristine and relaxing.", "business_type": "Salon", "platform": "Google"},
    {"author": "Marco Rossi", "rating": 3, "content": "Show was decent but technical issues with lighting in the second act.", "business_type": "Theater", "platform": "Yelp"},
    {"author": "Deepa Nair", "rating": 5, "content": "The doctor really took time to explain everything. Felt genuinely cared for.", "business_type": "Clinic", "platform": "Google"},
    {"author": "Jake Thompson", "rating": 2, "content": "Overpriced for what you get. Service was slow and inconsistent.", "business_type": "Restaurant", "platform": "Zomato"},
    {"author": "Preethi Raj", "rating": 5, "content": "Luxury at its finest! The spa package was divine. Coming back next month!", "business_type": "Salon", "platform": "Google"},
    {"author": "Juan Garcia", "rating": 5, "content": "¡La comida estuvo excelente y el servicio fue impecable! Muy recomendado.", "business_type": "Restaurant", "platform": "Google"},
    {"author": "Marie Dubois", "rating": 2, "content": "Le service était très lent et la nourriture était froide. Très déçu.", "business_type": "Restaurant", "platform": "Google"},
]

def get_simulated_realtime_review() -> Dict:
    """Returns a random review with current timestamp for real-time simulation"""
    data = load_data()
    rules = data.get("automation_rules", [])
    profiles = data.get("business_profiles", [])
    
    # Select a random profile if multiple exist, otherwise use default
    profile = random.choice(profiles) if profiles else data.get("business_profile", {"id": "default", "name": "Default Business", "type": "Restaurant"})
    
    base = random.choice(REALTIME_REVIEW_POOL)
    review_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    
    # Comprehensive Analysis
    analysis = analyze_review_completely(base["content"])
    
    review = {
        "id": f"rt_{review_id}",
        "author": base["author"],
        "rating": base["rating"],
        "content": base["content"],
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "source": base["platform"],
        "sentiment": analysis["sentiment"],
        "language": analysis["language"],
        "language_code": analysis["language_code"],
        "categories": analysis["categories"],
        "business_type": profile.get("type", base["business_type"]),
        "platform": base["platform"],
        "status": "Pending",
        "is_new": True,
        "profile_id": profile.get("id", "default")
    }
    
    # Apply automation rules
    review = apply_automation_rules(review, rules)
    
    # Persist to storage
    data.setdefault("reviews", []).insert(0, review)
    save_data(data)
    
    return review

# ─── CSV Export ───────────────────────────────────────────────────────────────

def generate_csv_report(reviews: List[Dict]) -> str:
    import io
    import csv
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Author", "Rating", "Business Type", "Platform", "Sentiment", "Status", "Date", "Review Content"])
    for r in reviews:
        writer.writerow([
            r.get("id"), r.get("author"), r.get("rating"),
            r.get("business_type", ""), r.get("platform", ""),
            r.get("sentiment"), r.get("status"), r.get("date"),
            r.get("content", "").replace("\n", " ")
        ])
    return output.getvalue()
