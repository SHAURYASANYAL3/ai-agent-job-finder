from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from database.connection import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Job Platform API",
    description="API for the AI-Powered Job & Internship Recommendation Platform",
    version="1.0.0",
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to the AI Job Platform API"}
