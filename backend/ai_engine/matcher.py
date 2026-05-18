def calculate_match_score(user_profile: dict, job: dict) -> dict:
    """
    Weighted scoring:
    - Industry Match -> 40%
    - Skill Match -> 30%
    - Experience -> 15%
    - Certifications -> 10%
    - Education -> 5%
    """
    user_skills = user_profile.get("skills", [])
    user_industry = user_profile.get("industry", "Unknown")
    user_yoe = user_profile.get("yoe", 0)
    user_certs = len(user_profile.get("certifications", []))
    has_degree = user_profile.get("scores", {}).get("education_flag", False)
    
    job_skills = job.get("required_skills", [])
    job_industry = job.get("industry", "General")
    
    # 1. Industry Match (Strict rejection if mismatched, unless job is generic)
    if job_industry != "General" and user_industry != "General" and job_industry != user_industry:
        return {"score": 0, "rejected": True, "reason": f"Industry Mismatch: {user_industry} resume vs {job_industry} job."}
    
    industry_score = 40 # Assuming they match or job is generic enough to pass filter
    
    # 2. Skill Match (30%)
    user_set = set([s.lower() for s in user_skills])
    job_set = set([s.lower() for s in job_skills])
    
    if not job_set:
        skill_score = 25 # Default high score if job doesn't specify skills
        matched = user_skills[:3]
        missing = ["Domain specifics"]
    else:
        matched_raw = list(user_set.intersection(job_set))
        missing_raw = list(job_set.difference(user_set))
        matched = [s for s in job_skills if s.lower() in matched_raw]
        missing = [s for s in job_skills if s.lower() in missing_raw]
        skill_score = int((len(matched) / max(len(job_set), 1)) * 30)

    # 3. Experience Match (15%) - Assuming basic alignment for live jobs
    exp_score = 15 if user_yoe > 0 else 5
    
    # 4. Certifications (10%)
    cert_score = 10 if user_certs > 0 else 0
    
    # 5. Education (5%)
    edu_score = 5 if has_degree else 0
    
    total_score = industry_score + skill_score + exp_score + cert_score + edu_score

    return {
        "score": total_score,
        "rejected": False,
        "missing": missing,
        "matched": matched
    }

def generate_career_guidance(job_title: str, missing_skills: list, matched_skills: list, industry: str) -> str:
    if not missing_skills or missing_skills == ["Domain specifics"]:
        return f"🔥 PERFECT FIT! Your {industry} profile strongly aligns with this {job_title} role. Your core skills ({', '.join(matched_skills[:2])}) make you a highly competitive candidate."
        
    advice = f"Your {industry} background matches this {job_title} role, primarily due to your experience with {', '.join(matched_skills[:2]) if matched_skills else 'core domain principles'}.\n\n"
    advice += "To maximize your hiring chances, address these specific gaps found in the live listing:\n\n"
    
    for skill in missing_skills[:2]:
        advice += f"• **Missing Skill:** {skill}. Consider completing a quick certification or adding relevant projects to bypass the ATS filter for this requirement.\n"
        
    return advice
