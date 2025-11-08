import os, json, requests
from .config import get_settings

def _extract_text_from_resp(j):
    if not isinstance(j, dict):
        return None
    if 'candidates' in j and isinstance(j['candidates'], list) and j['candidates']:
        first = j['candidates'][0]
        for k in ('output','content','text'):
            if k in first and isinstance(first[k], str):
                return first[k]
    if 'output' in j:
        out = j['output']
        if isinstance(out, list) and out:
            o0 = out[0]
            if isinstance(o0, dict):
                for k in ('text','content'):
                    if k in o0 and isinstance(o0[k], str):
                        return o0[k]
                if 'content' in o0 and isinstance(o0['content'], list):
                    for part in o0['content']:
                        if isinstance(part, dict) and 'text' in part:
                            return part['text']
    for v in j.values():
        if isinstance(v, str) and len(v) > 20:
            return v
    return None

def summarize_with_gemini(project_brief: str, site_name: str, candidates_json: dict) -> str:
    settings = get_settings()
    api_key = settings.gemini_api_key
    if not api_key:
        best = min(candidates_json["candidates"], key=lambda c: c["landed_cost"]*0.6 + c["eta_minutes"]*0.4)
        cheapest = min(candidates_json["candidates"], key=lambda c: c["landed_cost"])
        fastest = min(candidates_json["candidates"], key=lambda c: c["eta_minutes"])
        lines = [
            f"SmartQuotation (fallback) for {site_name}:",
            f"- Best overall: {best['vendor_name']} (₹{best['landed_cost']:.0f}, ETA {best['eta_minutes']} min)",
            f"- Cheapest: {cheapest['vendor_name']} (₹{cheapest['landed_cost']:.0f})",
            f"- Fastest: {fastest['vendor_name']} ({fastest['eta_minutes']} min)",
            "Set GEMINI_API_KEY to enable rich narrative and RFQ/Invoice JSON."
        ]
        return "\n".join(lines)

    candidate_models = [
        'models/gemini-pro-latest',
        'models/gemini-2.5-pro',
        'models/gemini-2.5-flash',
        'models/gemini-flash-latest'
    ]
    base_urls = [
        'https://generativelanguage.googleapis.com/v1',
        'https://generativelanguage.googleapis.com/v1beta2',
        'https://generativelanguage.googleapis.com/v1beta3'
    ]
    system = "You are SmartQuotation, a B2B procurement assistant. NEVER invent prices/ETAs; use the provided JSON."
    prompt = f"""{system}

Project brief:
{project_brief}
Site: {site_name}

CANDIDATES JSON:
{json.dumps(candidates_json, indent=2)}

Tasks:
1) Pick Best overall, Cheapest, Fastest (2–4 bullets WHY).
2) Provide a concise table (vendor, landed_cost, ETA(min), on_time_rate, top risk).
3) Draft RFQ text for the recommended vendor.
4) Provide Invoice JSON fields based on chosen candidate's numeric values only.
"""

    headers = {"Content-Type": "application/json"}
    for m in candidate_models:
        model_id = m.split('/')[-1]
        for base in base_urls:
            url = f"{base}/models/{model_id}:generate?key={api_key}"
            bodies = [
                {"prompt": {"text": prompt}},
                {"input": prompt},
                {"instances": [{"content": prompt}]}
            ]
            for body in bodies:
                try:
                    r = requests.post(url, json=body, headers=headers, timeout=20)
                    if r.status_code >= 400:
                        continue
                    j = r.json()
                    txt = _extract_text_from_resp(j)
                    if txt:
                        return txt
                except Exception:
                    continue
    return "Gemini API call failed. Verify GEMINI_API_KEY and model access. Returning without LLM."
