import os
import re
import json
import fitz  # PyMuPDF
from typing import Dict, List, Any
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Multi-industry skill taxonomy
INDUSTRY_TAXONOMY = {
    "Software/IT": ["Python", "Java", "JavaScript", "React", "Node.js", "Docker", "AWS", "Machine Learning", "Software Engineer", "Frontend"],
    "Civil Engineering": ["AutoCAD", "STAAD Pro", "Concrete Design", "Revit", "Civil 3D", "Surveying", "Structural", "Construction"],
    "Electrical": ["Wiring", "Transformer Maintenance", "Circuit Design", "PLC", "SCADA", "High Voltage", "Electrician"],
    "Mechanical": ["SolidWorks", "CNC", "HVAC", "Thermodynamics", "Machining", "Mechanical Engineer"],
    "Healthcare": ["Patient Care", "CPR", "Nursing", "EMR", "HIPAA", "Triage", "Medical Billing", "RN", "Doctor"],
    "Finance": ["Financial Modeling", "Excel", "Accounting", "Risk Management", "Valuation", "Bloomberg", "Analyst"],
    "Logistics": ["Supply Chain", "Inventory Management", "Logistics", "SAP", "Procurement", "Warehouse"],
    "Marketing": ["SEO", "Content Marketing", "Campaigns", "Google Analytics", "Social Media", "Copywriting"],
    "Sales": ["B2B", "CRM", "Cold Calling", "Lead Generation", "Salesforce", "Account Executive"]
}

def extract_text_from_pdf(content: bytes) -> str:
    pdf_document = fitz.open("pdf", content)
    text = ""
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        text += page.get_text()
    return text

def parse_with_openai(text: str) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or "sk-abcdef" in api_key:
        raise ValueError("Valid OpenAI API key not present in environment variables.")

    client = OpenAI(api_key=api_key)
    
    prompt = f"""
    You are an expert AI Resume Parser. Parse the following resume text and return a strictly structured JSON object.
    Do not add any markdown formatting, code block markers (like ```json), or conversational text. Return ONLY the raw JSON.

    Resume Text:
    \"\"\"{text}\"\"\"

    Strict JSON Schema expected:
    {{
        "name": "Full Name of candidate",
        "industry": "One of: Software/IT, Civil Engineering, Electrical, Mechanical, Healthcare, Finance, Logistics, Marketing, Sales",
        "yoe": 3,  // integer representing years of experience
        "skills": ["Skill1", "Skill2"],
        "certifications": ["Cert1", "Cert2"],
        "job_titles": ["Title1", "Title2"],
        "projects": ["Project1", "Project2"],
        "achievements": ["Achievement1", "Achievement2"],
        "ats_score": 85,  // overall ATS compatibility score out of 100
        "scores": {{
            "skill_strength": 90,  // out of 100
            "experience": 80,  // out of 100
            "project_quality": 85,  // out of 100
            "certification": 70  // out of 100
        }},
        "suggestions": [
            "Actionable feedback 1",
            "Actionable feedback 2"
        ]
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a precise resume parsing engine that returns pure JSON structure."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1
    )
    
    raw_content = response.choices[0].message.content.strip()
    
    # Simple regex block strip if model accidentally wrapped in markdown code blocks
    if raw_content.startswith("```"):
        raw_content = re.sub(r"^```json\s*|```$", "", raw_content, flags=re.MULTILINE).strip()
        
    return json.loads(raw_content)

def parse_with_heuristics(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    lines = text.split('\n')
    
    # 1. Full Name (Heuristic: first non-empty line)
    name = "Unknown"
    for line in lines:
        if len(line.strip().split()) >= 2 and len(line) < 30:
            name = line.strip().title()
            break

    # 2. Industry & Skills
    found_skills = []
    industry_scores = {ind: 0 for ind in INDUSTRY_TAXONOMY.keys()}
    
    for industry, skills in INDUSTRY_TAXONOMY.items():
        for skill in skills:
            if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower) or skill.lower() in text_lower:
                found_skills.append(skill)
                industry_scores[industry] += 1
                
    detected_industry = max(industry_scores, key=industry_scores.get) if max(industry_scores.values()) > 0 else "General Professional"

    # 3. Years of Experience
    yoe_match = re.search(r'(\d+)\+?\s*years? of experience', text_lower)
    yoe = int(yoe_match.group(1)) if yoe_match else len(re.findall(r'(20[0-2][0-9])', text)) // 2

    # 4. Certifications
    certs = []
    for line in lines:
        if re.search(r'(?i)(certification|certified|license|course:)', line):
            if len(line.strip()) > 5:
                certs.append(line.strip())

    # 5. Job Titles (Heuristic based on industry keywords + roles)
    titles = []
    role_keywords = ["Engineer", "Developer", "Manager", "Analyst", "Coordinator", "Technician", "Consultant", "Director", "Designer", "Nurse"]
    for line in lines:
        for kw in role_keywords:
            if kw.lower() in line.lower() and len(line) < 40:
                titles.append(line.strip())
                break
                
    # 6. Projects & Achievements
    projects = []
    achievements = []
    for line in lines:
        if re.search(r'(?i)(project:|portfolio|github\.com)', line):
            projects.append(line.strip())
        if re.search(r'(?i)^(increased|reduced|achieved|developed|managed|led|designed)', line.strip()):
            achievements.append(line.strip())

    # Granular Scoring
    skill_score = min(len(set(found_skills)) * 10, 100)
    exp_score = min(yoe * 15, 100)
    cert_score = 100 if len(certs) > 0 else 20
    proj_score = 100 if len(projects) > 0 else 20
    edu_score = 100 if re.search(r'(?i)(university|college|bachelor|degree)', text_lower) else 30
    
    ats_score = int((skill_score * 0.4) + (exp_score * 0.3) + (proj_score * 0.15) + (cert_score * 0.1) + (edu_score * 0.05))

    # Smart Improvement Suggestions
    suggestions = []
    if not achievements:
        suggestions.append("Add measurable achievements to your experience section (e.g., 'Increased efficiency by 20%').")
    if not projects and detected_industry in ["Software/IT", "Mechanical", "Civil Engineering"]:
        suggestions.append(f"Add 2 production-level or capstone projects relevant to {detected_industry}.")
    if not certs:
        suggestions.append(f"Include industry-recognized certifications for better {detected_industry} opportunities.")
    if len(found_skills) < 4:
        suggestions.append(f"Improve ATS keywords by adding specific tools and methodologies used in {detected_industry}.")
        
    return {
        "name": name,
        "industry": detected_industry,
        "yoe": max(1, yoe),
        "skills": list(set(found_skills)),
        "certifications": certs[:3],
        "job_titles": list(set(titles[:2])),
        "projects": projects[:2],
        "achievements": achievements[:3],
        "ats_score": ats_score,
        "scores": {
            "skill_strength": skill_score,
            "experience": exp_score,
            "project_quality": proj_score,
            "certification": cert_score
        },
        "suggestions": suggestions
    }

def parse_resume_content(content: bytes, filename: str) -> Dict[str, Any]:
    text = ""
    if filename and filename.endswith(".pdf"):
        text = extract_text_from_pdf(content)
    else:
        text = content.decode('utf-8', errors='ignore')

    # Try LLM Parser first
    try:
        print("Attempting premium LLM resume parsing...")
        return parse_with_openai(text)
    except Exception as e:
        print(f"LLM Parsing skipped/failed: {str(e)}. Falling back to localized heuristic parser.")
        return parse_with_heuristics(text)
