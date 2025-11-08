from typing import List, Dict, Callable

def freight_cost(distance_km: float, weight_tons: float, base_rate_per_tkm: float=3.5,
                 fuel_surcharge_pct: float=0.08, tolls: float=0.0) -> float:
    base = distance_km * max(weight_tons, 1e-6) * base_rate_per_tkm
    return base * (1 + fuel_surcharge_pct) + tolls

def tax_gst(amount: float, gst_pct: float) -> float:
    return amount * (gst_pct/100.0)

def material_cost(items: List[Dict], price_lookup: Callable[[str], float]) -> float:
    total = 0.0
    for it in items:
        unit_price = it.get("unit_price")
        if unit_price is None:
            unit_price = price_lookup(it["sku"])
        total += it["qty"] * float(unit_price)
    return total

def demo_price_lookup(sku: str) -> float:
    price_map = {
        "cement_bag_50kg": 360.0,
        "rebar_tmt_10mm_ton": 51500.0,
        "sand_mt": 1200.0,
        # aliases
        "cement": 360.0,
        "tmt": 52000.0,
        "sand": 1100.0,
    }
    return price_map.get(sku, 1000.0)
