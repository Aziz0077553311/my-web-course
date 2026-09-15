from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(title="EduFlow API", version="0.1.0")


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "EduFlow API"}

