import os
from typing import Optional
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "Smart Quote Service"
    version: str = "1.0.0"
    gemini_api_key: Optional[str] = None
    osrm_url: str = os.environ.get("OSRM_URL", "http://localhost:5000")
    currency: str = "INR"
    gst_pct: float = 18.0
    invoice_dir: str = os.environ.get("INVOICE_DIR", "./invoices")

def get_settings() -> Settings:
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    s = Settings(gemini_api_key=key)
    os.makedirs(s.invoice_dir, exist_ok=True)
    return s
