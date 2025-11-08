import random, datetime as dt
from fastapi import APIRouter, HTTPException, status
from .schemas import (
    PrepareRequest,
    PrepareResponse,
    CandidateOut,
    InvoiceRequest,
    InvoiceOut,
    SimplePrepareRequest,
    Item,
    Project,
)
from .config import get_settings
from .routing import route_distance_eta
from .costing import material_cost, freight_cost, tax_gst, demo_price_lookup
from .ranking import Candidate, rank_candidates
from .llm import summarize_with_gemini
from .invoice import render_invoice

router = APIRouter()

# Replace with your DB later
VENDORS = [
    {"id": 1, "name": "Mumbai Steel & Cement Co", "lat": 19.0760, "lng": 72.8777, "on_time_rate": 0.92, "quality_score": 0.88, "accept_prob": 0.65, "rate_tkm": 3.9, "price_volatility": 0.03},
    {"id": 2, "name": "Chennai BuildSupplies",   "lat": 13.0827, "lng": 80.2707, "on_time_rate": 0.89, "quality_score": 0.86, "accept_prob": 0.60, "rate_tkm": 3.7, "price_volatility": 0.035},
    {"id": 3, "name": "Delhi InfraMart",          "lat": 28.7041, "lng": 77.1025, "on_time_rate": 0.94, "quality_score": 0.90, "accept_prob": 0.70, "rate_tkm": 4.0, "price_volatility": 0.028},
    {"id": 4, "name": "Ahmedabad Materials",      "lat": 23.0225, "lng": 72.5714, "on_time_rate": 0.91, "quality_score": 0.87, "accept_prob": 0.62, "rate_tkm": 3.6, "price_volatility": 0.032},
    {"id": 5, "name": "Bengaluru Supply Hub",     "lat": 12.9716, "lng": 77.5946, "on_time_rate": 0.90, "quality_score": 0.89, "accept_prob": 0.68, "rate_tkm": 3.8, "price_volatility": 0.031},
]

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/health/ai")
def health_ai():
    try:
        has_key = bool(get_settings().gemini_api_key)
        return {"ai_key_present": has_key}
    except Exception:
        return {"ai_key_present": False}

def compute_candidates(req: PrepareRequest):
    settings = get_settings()
    origin = (req.project.site_lat, req.project.site_lng)

    items_dict = [it.dict() for it in req.items]
    total_weight = sum((it.get("weight_ton") or 0.0) for it in items_dict)
    m_cost = material_cost(items_dict, demo_price_lookup)

    cands = []
    for v in VENDORS:
        dist_km, eta_min, _ = route_distance_eta(settings.osrm_url, origin, (v["lat"], v["lng"]), dow=2, hour=10, rain_mm=0.0)
        f_cost = freight_cost(dist_km, total_weight, base_rate_per_tkm=v["rate_tkm"])
        taxes = tax_gst(m_cost, settings.gst_pct)
        handling = 0.01 * m_cost
        c = Candidate(
            vendor_id=v["id"], vendor_name=v["name"], distance_km=dist_km,
            on_time_rate=v["on_time_rate"], quality_score=v["quality_score"],
            acceptance_prob=v["accept_prob"], material_cost=m_cost,
            freight_cost=f_cost, taxes=taxes, handling=handling,
            eta_minutes=eta_min, price_volatility=v["price_volatility"]
        )
        cands.append(c)

    ranked = rank_candidates(cands)
    top = [CandidateOut(
        vendor_id=c.vendor_id, vendor_name=c.vendor_name,
        landed_cost=round(c.landed_cost,2),
        breakdown={
            "material": round(c.material_cost,2),
            "freight": round(c.freight_cost,2),
            "taxes": round(c.taxes,2),
            "handling": round(c.handling,2)
        },
        eta_minutes=int(c.eta_minutes),
        on_time_rate=round(c.on_time_rate,2),
        quality_score=round(c.quality_score,2),
        acceptance_prob=round(c.acceptance_prob,2),
        distance_km=round(c.distance_km,1)
    ) for (c, s) in ranked[:5]]

    candidates_json = {
        "currency": settings.currency,
        "gst_pct": settings.gst_pct,
        "candidates": [t.dict() for t in top]
    }
    return top, candidates_json

def compute_prepare(req: PrepareRequest) -> PrepareResponse:
    top, candidates_json = compute_candidates(req)
    summary = summarize_with_gemini(req.project.brief, req.project.site_name, candidates_json)
    if not summary or summary.startswith("SmartQuotation (fallback)") or summary.startswith("Gemini API call failed"):
        summary = ""
    # Console log for verification of AI summary vs computed
    try:
        if summary:
            print("[AI SUMMARY]", summary)
        else:
            print("[AI SUMMARY] (empty) -> Computed mode (no Gemini)")
    except Exception:
        pass
    return {"summary": summary, "candidates": top}


@router.post("/v1/smart-quote/prepare", response_model=PrepareResponse)
def prepare(req: PrepareRequest):
    return compute_prepare(req)


@router.post("/v1/smart-quote/prepare-simple", response_model=PrepareResponse)
def prepare_simple(req: SimplePrepareRequest):
    # Helpers
    def infer_coords_from_address(addr: str):
        if not addr:
            return None
        a = addr.lower()
        cities = {
            "pune": (18.5204, 73.8567),
            "mumbai": (19.0760, 72.8777),
            "bombay": (19.0760, 72.8777),
            "delhi": (28.7041, 77.1025),
            "new delhi": (28.6139, 77.2090),
            "chennai": (13.0827, 80.2707),
            "hyderabad": (17.3850, 78.4867),
            "hyd": (17.3850, 78.4867),
            "bengaluru": (12.9716, 77.5946),
            "bangalore": (12.9716, 77.5946),
            "ahmedabad": (23.0225, 72.5714),
        }
        for k, v in cities.items():
            if k in a:
                return v
        return None

    def parse_quantity(q: str) -> float:
        # Extract leading number; very rough multiplier for demonstration
        if not q:
            return 1.0
        import re
        m = re.search(r"([0-9]+(?:\.[0-9]+)?)", q)
        if not m:
            return 1.0
        val = float(m.group(1))
        ql = q.lower()
        # Heuristic scaling based on unit keywords
        if "sq ft" in ql or "sqft" in ql:
            return max(1.0, val / 200.0)  # ~200 sq ft per base unit
        if "m3" in ql or "cubic" in ql:
            return max(1.0, val / 2.0)
        if "ton" in ql or "tons" in ql or "tonne" in ql:
            return max(1.0, val)
        if "meter" in ql or "metre" in ql or "m " in ql:
            return max(1.0, val / 50.0)
        return max(1.0, val)

    # Map simple fields from the frontend into structured request
    site_lat = req.site_lat if req.site_lat is not None else None
    site_lng = req.site_lng if req.site_lng is not None else None
    if site_lat is None or site_lng is None:
        guessed = infer_coords_from_address(req.address or "")
        if guessed:
            site_lat, site_lng = guessed
        else:
            site_lat, site_lng = (18.5204, 73.8567)  # Pune default

    qty_multiplier = parse_quantity(req.quantity or "")

    brief = (
        f"Project type: {req.project_type}. Quantity: {req.quantity or 'N/A'}. "
        f"Materials: {', '.join(req.materials)}."
    )
    project = Project(
        brief=brief,
        site_name=req.address,
        site_lat=site_lat,
        site_lng=site_lng,
        delivery_window_days=14,
    )

    # Simple material to SKU + rough base weight per unit (tons)
    material_map = {
        "cement": ("cement_bag_50kg", 0.05),
        "sand": ("sand_mt", 1.0),
        "steel tmt": ("rebar_tmt_10mm_ton", 1.0),
        "tmt": ("rebar_tmt_10mm_ton", 1.0),
        "bricks": ("bricks_1000", 1.6),
        "aggregates": ("aggregates_mt", 1.0),
        "concrete": ("concrete_m3", 2.4),
    }

    items = []
    per_item_qty = max(1, int(round(qty_multiplier)))
    for m in req.materials:
        key = m.strip().lower()
        sku, base_wt = material_map.get(key, (key, 1.0))
        items.append(
            Item(
                sku=sku,
                desc=m,
                qty=per_item_qty,
                unit_price=None,
                weight_ton=base_wt * per_item_qty,
            )
        )

    prep = PrepareRequest(project=project, items=items)
    return compute_prepare(prep)

@router.post("/v1/smart-quote/prepare-ai")
def prepare_ai(req: SimplePrepareRequest):
    # Build structured request like prepare_simple
    site_lat = req.site_lat if req.site_lat is not None else None
    site_lng = req.site_lng if req.site_lng is not None else None
    if site_lat is None or site_lng is None:
        # reuse inference from prepare_simple by duplicating minimal logic
        a = (req.address or "").lower()
        cities = {
            "pune": (18.5204, 73.8567),
            "mumbai": (19.0760, 72.8777),
            "bombay": (19.0760, 72.8777),
            "delhi": (28.7041, 77.1025),
            "new delhi": (28.6139, 77.2090),
            "chennai": (13.0827, 80.2707),
            "hyderabad": (17.3850, 78.4867),
            "hyd": (17.3850, 78.4867),
            "bengaluru": (12.9716, 77.5946),
            "bangalore": (12.9716, 77.5946),
            "ahmedabad": (23.0225, 72.5714),
        }
        for k, v in cities.items():
            if k in a:
                site_lat, site_lng = v
                break
        if site_lat is None or site_lng is None:
            site_lat, site_lng = (18.5204, 73.8567)

    brief = (
        f"Project type: {req.project_type}. Quantity: {req.quantity or 'N/A'}. "
        f"Materials: {', '.join(req.materials)}."
    )
    project = Project(
        brief=brief,
        site_name=req.address,
        site_lat=site_lat,
        site_lng=site_lng,
        delivery_window_days=14,
    )

    # minimal items list (weights are not critical for AI-only summary)
    items = [Item(sku=m.lower().replace(" ", "_"), desc=m, qty=1) for m in req.materials]
    prep = PrepareRequest(project=project, items=items)

    top, candidates_json = compute_candidates(prep)
    summary = summarize_with_gemini(project.brief, project.site_name, candidates_json)
    if not summary or summary.startswith("SmartQuotation (fallback)") or summary.startswith("Gemini API call failed"):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI response unavailable")
    # Console log for verification of AI summary
    try:
        print("[AI SUMMARY]", summary)
    except Exception:
        pass
    return {"summary": summary}

@router.post("/v1/smart-quote/invoice", response_model=InvoiceOut)
def invoice(req: InvoiceRequest):
    settings = get_settings()
    chosen = req.chosen_candidate

    lines = []
    for it in req.items:
        unit = it.unit_price if it.unit_price is not None else 0.0
        lines.append({
            "sku": it.sku, "desc": it.desc, "qty": it.qty,
            "unit_price": unit, "line_total": unit*it.qty
        })
    subtotal = sum(x["line_total"] for x in lines)
    freight = chosen.breakdown["freight"]
    taxes = chosen.breakdown["taxes"]
    grand_total = subtotal + freight + taxes

    days = max(1, int(chosen.eta_minutes // (60*24)))
    est_date = (dt.date.today() + dt.timedelta(days=days)).isoformat()

    inv = {
        "invoice_no": f"AUTO-{dt.date.today().isoformat()}-{random.randint(1000,9999)}",
        "bill_to": "MJCET Construction Pvt Ltd",
        "ship_to": req.project.site_name,
        "items": lines,
        "freight": freight,
        "taxes": taxes,
        "grand_total": grand_total,
        "estimated_delivery_date": est_date,
        "payment_terms": "Net 15",
        "notes": f"Vendor: {chosen.vendor_name}. Distance {chosen.distance_km} km. "
    }

    file_stem = inv["invoice_no"].replace("/", "-")
    out_pdf = f"{settings.invoice_dir}/{file_stem}.pdf"
    out_html = f"{settings.invoice_dir}/{file_stem}.html"
    file_path = render_invoice(inv, out_pdf_path=out_pdf, out_html_path=out_html)
    inv["file_path"] = file_path
    return inv
