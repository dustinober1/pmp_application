import os
import json
import time
import uuid
import random
from dotenv import load_dotenv
from google import genai
from google.genai import types

# 1. Setup
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("API Key not found. Please set GOOGLE_API_KEY in your .env file.")

# Initialize the new Google GenAI client
client = genai.Client(api_key=api_key)
model_id = "models/gemini-flash-lite-latest" # Using the latest flash-lite model

# 2. Domain & Task Definitions (2026 ECO)
domains = {
    "People": {
        "weight": 0.33,
        "tasks": [
            "Conflict Management Techniques", "Tuckman's Ladder & Team Stages",
            "Servant Leadership Principles", "Stakeholder Engagement Models",
            "Virtual Team Tools", "Emotional Intelligence (EI) Components",
            "Knowledge Transfer Methods", "Agile Team Roles"
        ]
    },
    "Process": {
        "weight": 0.41,
        "tasks": [
            "Agile Ceremonies (Retrospectives, Standups)", "Earned Value Management (EVM) Formulas",
            "Critical Path Method (CPM)", "Risk Response Strategies (Positive/Negative)",
            "Procurement Contract Types", "Quality Control Tools (Pareto, Fishbone)",
            "Change Control Board (CCB) Logic", "Project Closure Steps"
        ]
    },
    "Business Environment": {
        "weight": 0.26,
        "tasks": [
            "Compliance & Regulatory Requirements", "Project Governance Frameworks",
            "Organizational Change Management (OCM)", "Value Delivery & Benefit Realization",
            "AI Ethics in Project Management", "Sustainability & ESG Factors",
            "Strategic Alignment"
        ]
    }
}

# 3. Flashcard Generation Function
def generate_flashcard_batch(domain_name, topic, existing_fronts, batch_size=10):
    # Pass a sample of existing fronts to prevent immediate duplicates
    avoid_list = ", ".join(existing_fronts[-50:]) if existing_fronts else "None"
    
    prompt = f"""
    Act as a PMP Exam Tutor for the July 2026 ECO.
    Reference: https://dustinober1.github.io/PMP-2026/
    
    DOMAIN: {domain_name}
    TOPIC: {topic}
    
    TASK: Generate {batch_size} unique, high-quality flashcards.
    
    DEDUPLICATION RULE: 
    Do NOT generate cards for these existing terms/questions: [{avoid_list}]
    
    TYPES OF CARDS:
    1. Term Definition (Front: Term -> Back: Definition)
    2. Inputs/Outputs (Front: "Key Output of..." -> Back: The Output)
    3. Formula/Logic (Front: Formula Name -> Back: The Math + Interpretation)
    4. Situational Trigger (Front: "If X happens, do..." -> Back: The immediate next step)
    
    STRICT JSON FORMAT:
    [
      {{
        "id": "{str(uuid.uuid4())}",
        "domain": "{domain_name}",
        "topic": "{topic}",
        "front": "string",
        "back": "string",
        "difficulty": "Easy|Medium|Hard"
      }}
    ]
    
    Return ONLY raw JSON. Do not include markdown code blocks.
    """
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error generating batch for {topic}: {e}")
        return []

# 4. Main Execution Loop
file_path = "pmp_flashcards_master.json"

if os.path.exists(file_path):
    with open(file_path, "r") as f:
        try:
            master_flashcard_deck = json.load(f)
            print(f"📂 Loaded {len(master_flashcard_deck)} existing cards.")
        except json.JSONDecodeError:
            master_flashcard_deck = []
else:
    master_flashcard_deck = []

total_target = 2000

print(f"🚀 Starting Flashcard Generation...")

for domain, info in domains.items():
    domain_target = int(total_target * info['weight'])
    
    # Accurate count of cards already in this domain
    current_domain_cards = [c for c in master_flashcard_deck if c['domain'] == domain]
    
    if len(current_domain_cards) >= domain_target:
        print(f"✅ Domain {domain} is complete ({len(current_domain_cards)}/{domain_target} cards).")
        continue
        
    print(f"\n--- Processing {domain} (Target: {domain_target}) ---")
    
    while len([c for c in master_flashcard_deck if c['domain'] == domain]) < domain_target:
        topic = random.choice(info['tasks'])
        current_fronts = [card['front'] for card in master_flashcard_deck]
        
        batch = generate_flashcard_batch(domain, topic, current_fronts)
        if batch:
            master_flashcard_deck.extend(batch)
            
            with open(file_path, "w") as f:
                json.dump(master_flashcard_deck, f, indent=2)
                
            current_count = len([c for c in master_flashcard_deck if c['domain'] == domain])
            print(f"  + {len(batch)} unique cards on '{topic}'. Domain Progress: {current_count}/{domain_target}")
            time.sleep(1.5)

print(f"\n✅ All batches complete. Final deck size: {len(master_flashcard_deck)}")