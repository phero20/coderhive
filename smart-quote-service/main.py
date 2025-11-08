import uvicorn
from fastapi import FastAPI
from app.api import router as smart_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os

# Load .env from this folder explicitly so it works with any CWD
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

app = FastAPI(
    title="Smart Quote Service",
    version="1.0.0",
    description="AI-powered Smart Quotation and Supply Chain Optimization API."
)

# include all the /v1/smart-quote routes
app.include_router(smart_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Smart Quote Service is running"}

if __name__ == "__main__":
    # Run using the app instance to avoid import string issues with reloader
    # (folder has a hyphen, which isn't a valid python module name).
    uvicorn.run(app, host="0.0.0.0", port=8001)
