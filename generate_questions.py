import os
import json
import time
import uuid
import random
from dotenv import load_dotenv
import google.generativeai as genai

# 1. Setup and Authentication
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('models/gemini-flash-lite-latest')

# 2. 2026 ECO Business Environment Domain Tasks (26% weighting)
business_tasks_2026 = [
    "Task 1: Define and establish project governance",
    "Task 2: Plan and manage project compliance",
    "Task 3: Manage and control changes",
    "Task 4: Remove impediments and manage issues",
    "Task 5: Plan and manage risk",
    "Task 6: Continuous improvement",
    "Task 7: Support organizational change",
    "Task 8: Evaluate external business environment changes"
]

industries = ["Global Finance", "Energy & Utilities", "Tech Startups", "Healthcare Systems", "Public Sector", "E-commerce"]

def generate_2026_business_batch(task, batch_num):
    industry = random.choice(industries)
    prompt = f"""
    Act as a PMP Content Creator for the July 2026 Exam Update.
    Reference: https://dustinober1.github.io/PMP-2026/ and the 2026 ECO.
    
    DOMAIN: BUSINESS ENVIRONMENT (26% Weight)
    TASK: {task}
    INDUSTRY: {industry}
    
    INSTRUCTION: Generate 5 HIGH-AMBIGUITY situational questions.
    
    2026 BUSINESS FOCUS:
    - Include scenarios on AI-assisted risk monitoring and ethical AI use.
    - Focus on Sustainability, ESG compliance, and social responsibility.
    - Emphasize Strategic Alignment and ROI (Business Value Realization).
    - Manage organizational change and cultural shifts (Task 7).
    
    STRICT FORMATTING:
    1. CHOICE SYMMETRY: All 4 choices must be within 10% character length.
    2. AMBIGUITY: Include 2 plausible choices; identify the 'BEST' or 'FIRST' action.
    3. EXPLANATIONS: Provide specific logic for the correct answer AND each of the 3 distractors.
    
    JSON SCHEMA:
    {{
      "domainId": "{str(uuid.uuid4())}",
      "questionText": "...",
      "scenario": "...",
      "choices": ["...", "...", "...", "..."],
      "correctAnswerIndex": 0,
      "explanation": "CORRECT: ... A: ... B: ... C: ... D: ...",
      "difficulty": "HARD",
      "methodology": "PREDICTIVE|AGILE|HYBRID",
      "createdBy": "30c6afc2-69f6-4139-880c-ebe4c96e8959"
    }}
    
    Return ONLY a raw JSON array.
    """
    
    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(text)

# 3. Execution Loop for 260 Questions (52 Batches)
master_business_bank = []
print("🚀 Starting 2026 Business Environment Generation (26% weighting)...")

for i in range(1, 53):
    task = random.choice(business_tasks_2026)
    print(f"Batch {i}/52 | Task: {task}")
    try:
        batch = generate_2026_business_batch(task, i)
        master_business_bank.extend(batch)
        
        with open("pmp_2026_business_bank.json", "w") as f:
            json.dump(master_business_bank, f, indent=2)
        
        time.sleep(2) 
    except Exception as e:
        print(f"Error: {e}")

print(f"✅ Success! {len(master_business_bank)} Business Environment questions saved.")