import math, requests
from typing import Tuple

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dlmb/2)**2
    return 2*R*math.asin(math.sqrt(a))

def try_osrm_distance_eta(osrm_url: str, origin: Tuple[float,float], dest: Tuple[float,float]):
    try:
        url = f"{osrm_url}/route/v1/driving/{origin[1]},{origin[0]};{dest[1]},{dest[0]}?overview=false"
        j = requests.get(url, timeout=4).json()
        dist_km = j["routes"][0]["distance"]/1000.0
        minutes = j["routes"][0]["duration"]/60.0
        return dist_km, minutes, "osrm"
    except Exception:
        return None, None, "fallback"

def route_distance_eta(osrm_url: str, origin: Tuple[float,float], dest: Tuple[float,float],
                       dow:int=2, hour:int=10, rain_mm:float=0.0):
    dist_km, minutes, src = try_osrm_distance_eta(osrm_url, origin, dest)
    if dist_km is None:
        dist_km = haversine_km(origin[0], origin[1], dest[0], dest[1])
        base_speed_kmph = 45.0
        minutes = (dist_km / base_speed_kmph) * 60.0
        src = "haversine"
    factor = 1.0
    if hour in range(8,11) or hour in range(17,21): factor += 0.15
    if rain_mm > 5: factor += 0.10
    if dow in [5,6]: factor += 0.05
    return dist_km, minutes*factor, src
