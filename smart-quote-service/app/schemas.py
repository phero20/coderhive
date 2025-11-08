from typing import List, Optional
from pydantic import BaseModel

class Item(BaseModel):
    sku: str
    desc: Optional[str] = ""
    qty: float
    unit_price: Optional[float] = None
    weight_ton: Optional[float] = 0.0

class Project(BaseModel):
    brief: str
    site_name: str
    site_lat: float
    site_lng: float
    delivery_window_days: int = 14

class PrepareRequest(BaseModel):
    project: Project
    items: List[Item]

class CandidateOut(BaseModel):
    vendor_id: int
    vendor_name: str
    landed_cost: float
    breakdown: dict
    eta_minutes: int
    on_time_rate: float
    quality_score: float
    acceptance_prob: float
    distance_km: float

class PrepareResponse(BaseModel):
    summary: str
    candidates: List[CandidateOut]

class SimplePrepareRequest(BaseModel):
    project_type: str
    address: str
    materials: List[str]
    quantity: Optional[str] = None
    site_lat: Optional[float] = None
    site_lng: Optional[float] = None

class InvoiceRequest(BaseModel):
    project: Project
    chosen_vendor_id: int
    chosen_candidate: CandidateOut
    items: List[Item]

class InvoiceOut(BaseModel):
    invoice_no: str
    bill_to: str
    ship_to: str
    items: list
    freight: float
    taxes: float
    grand_total: float
    estimated_delivery_date: str
    payment_terms: str = "Net 15"
    notes: str
    file_path: str
