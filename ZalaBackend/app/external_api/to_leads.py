from typing import List, Tuple
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from app.models.lead import Lead 
def _split_name(name: str) -> Tuple[str, str | None]:
    # naive split: "John Smith" -> ("John", "Smith"); "Virage" -> ("Virage", None)
    parts = name.split()
    if not parts:
        return ("", None)
    return (parts[0], " ".join(parts[1:]) or None)

def to_leads(items: list[dict]) -> List[Lead]:
    leads: List[Lead] = []
    for x in items:
        first, last = _split_name(x.get("name", ""))
        leads.append(
            Lead(
                first_name=first,
                last_name=last,
                email=None,  # you don't have emails in this payload
                phone_number=x.get("phone"),
                address=x.get("address"),
            )
        )
    return leads
