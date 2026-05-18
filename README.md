# AI-Powered Job & Internship Recommendation Platform

This platform acts as an intelligent career assistant. It parses resumes, extracts core skills and experiences using AI, and recommends highly relevant jobs/internships while highlighting skill gaps and learning opportunities.

## Project Structure

- `frontend/`: Next.js 14 App Router, Tailwind CSS, Framer Motion.
- `backend/`: FastAPI Python backend for rapid AI integration and high performance.
- `ai_engine/`: Utilities for parsing PDFs/DOCX, extracting NLP entities (spaCy), and semantic matching (Sentence Transformers, FAISS).
- `docker-compose.yml`: Local infrastructure including PostgreSQL and Redis.

## Getting Started

1. Set up your `.env` file in the backend with `OPENAI_API_KEY`.
2. Start the database and redis:
   ```bash
   docker-compose up -d db redis
   ```
3. Run the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
4. Run the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Key Features
- **Smart Resume Parsing**: Extracts skills, education, and experience.
- **AI Recommendation Engine**: Semantically matches candidate profile with jobs.
- **Career Guidance**: Explains *why* you match and *how* to improve via suggested courses/projects.
