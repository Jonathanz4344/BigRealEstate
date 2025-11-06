# gemini_places_agents.py
import os, json, re, pprint, time
from typing import List, Optional, Tuple

# New SDK (google-genai)
from google import genai
from google.genai import types

# Keep using your existing adapter so downstream code stays the same
# (If you prefer, you can rename this to gemini_to_leads and adjust elsewhere.)
from to_leads import openai_to_leads
from app.external_api.__init__ import GEMINI_API_KEY

# Fast, tool-capable model that supports Maps grounding + JSON mode
GEMINI_MODEL = "gemini-2.5-flash"

prompt_start = "I am a real estate agent, and I am looking to contact real estate agents in "
prompt_end = """ that have a good chance of being interested in buying one of my properties or getting me in contact with clients interested in buying. Try to find all the details before returning, but do not hallucinate. Leave a field blank if you need to.
Format exactly like this array of objects:
[
  {
    "firstName": "",
    "lastName": "",
    "phoneNumber": "",
    "email": "",
    "website": "",
    "businessName": "",
    "licenseNum": "",
    "address": ""
  }
]
Make sure:
- Output is valid JSON and easily parsed (no hidden Unicode, citations, or formatting artifacts).
- Do not return anything except the clean JSON array.
- EACH ENTRY SHOULD CONTAIN FIRST NAME, LAST NAME, AND EMAIL AT MINIMUM! If you can't get this information for a lead, don't add it.
- Prioritize obtaining addresses over license numbers.
- Return 10 agents. If you can't find 10 with full name + email, return fewer; again, ONLY RETURN THE CLEAN JSON ARRAY and ONLY INCLUDE ENTRIES WITH FULL NAMES AND EMAILS.
"""

# JSON schema to force well-formed structured output that your parser expects
# (Gemini "structured output": response_mime_type + response_schema)
LEAD_SCHEMA = types.Schema(
    type=types.Type.ARRAY,
    items=types.Schema(
        type=types.Type.OBJECT,
        required=["firstName", "lastName", "email"],
        properties={
            "firstName": types.Schema(type=types.Type.STRING),
            "lastName": types.Schema(type=types.Type.STRING),
            "phoneNumber": types.Schema(type=types.Type.STRING),
            "email": types.Schema(type=types.Type.STRING),
            "website": types.Schema(type=types.Type.STRING),
            "businessName": types.Schema(type=types.Type.STRING),
            "licenseNum": types.Schema(type=types.Type.STRING),
            "address": types.Schema(type=types.Type.STRING),
        },
    ),
)

def _make_client() -> genai.Client:
    if not GEMINI_API_KEY:
        raise RuntimeError("Set GEMINI_API_KEY in your environment.")
    return genai.Client(api_key=GEMINI_API_KEY)

def _build_config(lat_lng=None, enable_widget: bool = False) -> types.GenerateContentConfig:
    # Tools enabled, but NO response_mime_type / response_schema here (incompatible with tools)
    tools = [types.Tool(google_maps=types.GoogleMaps(enable_widget=enable_widget))]
    tool_config = None
    if lat_lng:
        lat, lng = lat_lng
        tool_config = types.ToolConfig(
            retrieval_config=types.RetrievalConfig(
                lat_lng=types.LatLng(latitude=lat, longitude=lng)
            )
        )
    return types.GenerateContentConfig(
        tools=tools,
        tool_config=tool_config,
        temperature=0.3,
    )

# Keep your typed schema to use on the SECOND pass (no tools):
LEAD_SCHEMA = types.Schema(
    type=types.Type.ARRAY,
    items=types.Schema(
        type=types.Type.OBJECT,
        required=["firstName", "lastName", "email"],
        properties={
            "firstName": types.Schema(type=types.Type.STRING),
            "lastName": types.Schema(type=types.Type.STRING),
            "phoneNumber": types.Schema(type=types.Type.STRING),
            "email": types.Schema(type=types.Type.STRING),
            "website": types.Schema(type=types.Type.STRING),
            "businessName": types.Schema(type=types.Type.STRING),
            "licenseNum": types.Schema(type=types.Type.STRING),
            "address": types.Schema(type=types.Type.STRING),
        },
    ),
)
def _second_pass_format_json(client, model: str, raw_text: str) -> list:
    """
    Second pass WITHOUT tools: use structured output to coerce valid JSON.
    """
    cfg = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=LEAD_SCHEMA,
        temperature=0.0,
    )
    prompt = (
        "Reformat the following content into a clean JSON array of lead objects that matches the schema. "
        "Return ONLY the JSON array, nothing else.\n\n"
        f"{raw_text}"
    )
    resp2 = client.models.generate_content(
        model=model,
        contents=prompt,
        config=cfg,
    )
    try:
        return json.loads(resp2.text or "[]")
    except Exception:
        return []
def _clean_to_json(text: str):
    """
    Safety net: sometimes LLMs add stray text.
    We try json parse; if it fails, lightly repair common issues.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        fixed = re.sub(r'([\{\,]\s*)(\w+)(\s*):', r'\1"\2"\3:', text)  # quote bare keys
        return json.loads(fixed)

def search_agents_gemini(
    location: str,
    dynamic_filter: str = "",
    max_results: int = 10,
    lat_lng: Optional[Tuple[float, float]] = None,
    enable_widget: bool = False,
) -> List[dict]:
    client = _make_client()

    # First pass (WITH Maps tool). No JSON mode; just instruct the model.
    prompt = prompt_start + location + prompt_end
    if dynamic_filter:
        prompt += f"\nIf possible, prioritize agents that match: {dynamic_filter}"
    prompt += "\n\nReturn ONLY the JSON array."

    cfg = _build_config(lat_lng=lat_lng, enable_widget=enable_widget)
    resp = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=cfg,
    )
    print("here")
    print(resp)
    print("here2")

    raw = resp.text or "[]"

    # Try direct parse first
    try:
        leads_json = _clean_to_json(raw)
    except Exception:
        # If it wasn't clean JSON, run a second pass WITHOUT tools using structured output
        leads_json = _second_pass_format_json(client, GEMINI_MODEL, raw)

    if isinstance(leads_json, list) and len(leads_json) > max_results:
        leads_json = leads_json[:max_results]

    try:
        leads = openai_to_leads(leads_json)
    except Exception:
        leads = leads_json
    return leads

if __name__ == "__main__":
    # Example: Miami, biasing toward $1.5M+ properties
    results = search_agents_gemini(
        "Miami, FL",
        dynamic_filter="selling properties with $1.5M+ value",
        max_results=10,
        # Optional: give coordinates to tighten locality (Downtown Miami approx)
        lat_lng=(25.774, -80.1937),
        enable_widget=False,  # set True only if your UI will render the Maps widget
    )
    print("DEBUG PRINT: Parsed leads")
    pprint.pprint(results)
