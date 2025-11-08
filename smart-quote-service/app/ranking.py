from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class Candidate:
    vendor_id: int
    vendor_name: str
    distance_km: float
    on_time_rate: float
    quality_score: float
    acceptance_prob: float
    material_cost: float
    freight_cost: float
    taxes: float
    handling: float
    eta_minutes: float
    price_volatility: float

    @property
    def landed_cost(self) -> float:
        risk_buffer = 0.02 * self.material_cost + 100.0 * self.price_volatility
        return self.material_cost + self.freight_cost + self.taxes + self.handling + risk_buffer

def _norm(arr):
    lo, hi = min(arr), max(arr)
    if hi - lo < 1e-9:
        return [0.0]*len(arr)
    return [(x - lo)/(hi - lo) for x in arr]

def rank_candidates(cands: List[Candidate], weights=None) -> List[Tuple[Candidate,float]]:
    if not cands:
        return []
    w = {"price":0.55,"eta":0.2,"sla":0.15,"rel":0.1} if weights is None else weights
    lc = [c.landed_cost for c in cands]
    et = [c.eta_minutes for c in cands]
    sla = [1-c.on_time_rate for c in cands]
    rel = [1-c.acceptance_prob for c in cands]
    score = [w["price"]*a + w["eta"]*b + w["sla"]*c + w["rel"]*d
             for a,b,c,d in zip(_norm(lc), _norm(et), _norm(sla), _norm(rel))]
    ranked = sorted(zip(cands, score), key=lambda x: x[1])
    return ranked
