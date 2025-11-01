from typing import List, Tuple
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
# from app.models.lead import Lead

from app.schemas.lead import LeadPublic
from app.schemas.contact import ContactPublic

import json
from pydantic import ValidationError

def _split_name(name: str) -> Tuple[str, str | None]:
    # naive split: "John Smith" -> ("John", "Smith"); "Virage" -> ("Virage", None)
    parts = name.split()
    if not parts:
        return ("", None)
    return (parts[0], " ".join(parts[1:]) or None)

# make a contactbase 
def gplaces_to_leads(items: list[dict]) -> List[LeadPublic]:
    # leads: List[Lead] = []
    # for x in items:
    #     first, last = _split_name(x.get("name", ""))
    #     leads.append(
    #         Lead(
    #             first_name=first,
    #             last_name=last,
    #             email=None,  
    #             phone_number=x.get("phone"),
    #             address=x.get("address"),
    #             businessName=x.get("name")
    #         )
    #     )
    # return leads
    leads: List[LeadPublic] = []

    for x in items:
        first, last = _split_name(x.get("name"))
        leads.append(
            LeadPublic(
                # LeadBase fields
                person_type=None,                         # unknown from Places
                business=x.get("name"),
                website=x.get("website"),
                license_num=None,
                notes=None,

                # LeadPublic required/extra fields
                lead_id=0,                                # placeholder (not persisted yet)
                created_by_user=None,                     # unknown in this context
                contact=ContactPublic(
                    contact_id=0,                         # placeholder
                    first_name=first,
                    last_name=last,
                    email=None,
                    phone=x.get("phone"),
                ),
                address=x.get("address"),                              # we can map to AddressPublic if you share its fields
                properties=[],                             # none from Places
            )
        )
    return leads

def rapid_to_leads(items: list[dict]) -> List[LeadPublic]:
    # leads: List[Lead] = []
    # for x in items:
    #     first, last = _split_name(x.get("fullName", ""))
    #     leads.append(
    #         Lead(
    #             first_name=first,
    #             last_name=last,
    #             email=None, 
    #             phone_number=x.get("phoneNumber"),
    #             address=x.get("location"),
    #             businessName=x.get("businessName")
    #         )
    #     )
    # return leads
    leads: List[LeadPublic] = []

    for x in items:
        first, last = _split_name(x.get("fullName", ""))
        leads.append(
            LeadPublic(
                # LeadBase fields
                person_type="agent",                         # unknown from Places
                business=x.get("businessName"),
                website=x.get("profilePhotoSrc"),
                license_num=None,
                notes=None,

                # LeadPublic required/extra fields
                lead_id=0,                                # placeholder (not persisted yet)
                created_by_user=None,                     # unknown in this context
                contact=ContactPublic(
                    contact_id=0,                         # placeholder
                    first_name=first,
                    last_name=last,
                    email=None,
                    phone=x.get("phoneNumber"),
                ),
                address=x.get("location"),                              # we can map to AddressPublic if you share its fields
                properties=[],                             # none from Places
            )
        )
    return leads

def openai_to_leads(items: list[dict]) -> List[LeadPublic]:
    leads: List[LeadPublic] = []
    for x in items:
        first = x.get("firstName", "")
        last = x.get("lastName", "")

        # Debug: print all fields we attempt to extract
        # print(f"DEBUG PRINT: firstName: {first}")
        # print(f"DEBUG PRINT: lastName: {last}")
        # print(f"DEBUG PRINT: business: {x.get("businessName")}")
        # print(f"DEBUG PRINT: website: {x.get("website")}")
        # print(f"DEBUG PRINT: licenseNum: {x.get("licenseNum")}")
        # print(f"DEBUG PRINT: email: {x.get("email")}")
        # print(f"DEBUG PRINT: phoneNumber: {x.get("phoneNumber")}")
        # print(f"DEBUG PRINT: address: {x.get("address")}")
        
        try:
            leads.append(
                LeadPublic(
                    # LeadBase fields
                    person_type="agent",
                    business=x.get("businessName"),
                    website=x.get("website"),
                    license_num=x.get("licenseNum"),
                    notes=None,
                    # LeadPublic required/extra fields
                    lead_id=0,                                # placeholder (not persisted yet)
                    created_by_user=None,                     # unknown in this context
                    contact=ContactPublic(
                        contact_id=0,                         # placeholder
                        first_name=first,
                        last_name=last,
                        email=x.get("email"),
                        phone=x.get("phoneNumber"),
                    ),
                    address=x.get("address"),                              # we can map to AddressPublic if you share its fields
                    properties=[],                            # none from LLM response
                )
            )
        except ValidationError as e:
            print(f"DEBUG PRINT: Skipping invalid lead - {e}")
            print(f"DEBUG PRINT: Raw data: {json.dumps(x, indent=2)}")
            continue

    return leads