from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from services.job_fetcher import LiveJobFetcher
from ai_engine.matcher import calculate_match_score, generate_career_guidance

router = APIRouter()

class ProfilePayload(BaseModel):
    industry: str
    skills: List[str]
    yoe: int
    certifications: List[str]
    scores: Dict[str, Any]

@router.post("/recommendations")
def get_job_recommendations(profile: ProfilePayload):
    """
    Get REAL, live AI-ranked job recommendations tailored strictly to the user's detected industry.
    Receives full parsed profile context from frontend to guarantee accurate 40/30/15/10/5 weighted scoring.
    """
    user_profile = profile.dict()
    detected_industry = user_profile.get("industry", "Software/IT")
    user_skills = user_profile.get("skills", [])

    # Fetch 100% REAL live jobs from public APIs
    fetcher = LiveJobFetcher()
    real_jobs = fetcher.fetch_real_jobs(industry=detected_industry, skills=user_skills)

    recommendations = []
    for job in real_jobs:
        match_data = calculate_match_score(user_profile, job)
        
        # Strict Industry Filter: Reject jobs with score 0 (Mismatch)
        if match_data.get("rejected", False) or match_data["score"] == 0:
            continue
            
        advice = generate_career_guidance(
            job_title=job["title"],
            missing_skills=match_data["missing"],
            matched_skills=match_data["matched"],
            industry=detected_industry
        )
        
        recommendations.append({
            "job_id": job["id"],
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "salary": job["salary_range"],
            "match_score": match_data["score"],
            "missing_skills": match_data["missing"],
            "matched_skills": match_data["matched"],
            "url": job["url"],
            "ai_advice": advice
        })
            
    # Sort by highest match score
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    
    if not recommendations:
        return {"status": "success", "recommendations": [], "message": f"No live jobs currently found matching {detected_industry} with your specific skills. Try expanding your search or checking back tomorrow."}
        
    return {"status": "success", "recommendations": recommendations}
