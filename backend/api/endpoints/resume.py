from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Resume, User
from ai_engine.parser import parse_resume_content

router = APIRouter()

@router.post("/upload")
async def upload_resume(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Endpoint to upload and parse a resume, and save it to the database.
    """
    if file.content_type not in [
        "application/pdf", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        "text/plain"
    ]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload PDF, DOCX, or TXT.")

    # Check if user exists, auto-create for demo
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        demo_user = User(id=user_id, email="demo@example.com", hashed_password="demo", full_name="Demo User")
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    try:
        content = await file.read()
        parsed_data = parse_resume_content(content, file.filename)
        
        # Save to DB
        new_resume = Resume(
            user_id=user_id,
            filename=file.filename,
            parsed_skills=parsed_data.get("skills", []),
            parsed_education=parsed_data.get("education", []),
            parsed_experience=parsed_data.get("experience", []),
            ats_score=parsed_data.get("ats_score", 0)
        )
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        
        return {"status": "success", "resume_id": new_resume.id, "parsed_data": parsed_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
