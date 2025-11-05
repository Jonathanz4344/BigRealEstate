# Zala API Route Reference

This document summarizes the REST endpoints exposed by the FastAPI service so the UI can wire requests without digging through the backend.

- **Base URL**: all application routes sit under the `/api` prefix unless noted.
- **Authentication**: no tokens yet; just supply the JSON payloads described below.
- **Pagination**: collection GETs accept `skip` and `limit` query params (default `0` and `100`).

---

## Root

| Method | Path | Purpose | Notes |
| --- | --- | --- | --- |
| GET | `/` | Health check | Returns `{"message": "Zala API is running"}`; no auth required. |

---

## Authentication (`/api/login`)

| Method | Path | Purpose | Body Fields | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/login/` | Authenticate a user | `username` *(string, required)*, `password` *(string, required)* | `UserPublic` (user details if credentials match) |
| POST | `/api/login/google` | Authenticate via Google | `id_token` *(string, required)* | `UserPublic` (populated from Google profile or linked user) |

401 is returned when credentials are invalid.

---

## Users (`/api/users`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/users/` | Create user | JSON: `username` *(<=15 chars)*, `password`, optional `profile_pic`, `role` | `UserPublic` |
| GET | `/api/users/` | List users | Query: `skip`, `limit` | `List[UserPublic]` |
| GET | `/api/users/batch` | Fetch multiple by id | Query: `ids=1&ids=2...` | `List[UserPublic]`; 404 if any id missing |
| GET | `/api/users/{user_id}` | Get single user | Path `user_id` | `UserPublic` (includes contact if linked) |
| PUT | `/api/users/{user_id}` | Update user | JSON: any of `username`, `password`, `profile_pic`, `role` | `UserPublic` |
| DELETE | `/api/users/{user_id}` | Delete user | Path `user_id` | 204 No Content |
| GET | `/api/users/{user_id}/contact` | Fetch linked contact | Path `user_id` | `ContactPublic`; 404 if missing |
| POST | `/api/users/{user_id}/contacts/{contact_id}` | Link existing contact | Path `user_id`, `contact_id` | `UserPublic` |
| DELETE | `/api/users/{user_id}/contacts/{contact_id}` | Unlink contact | Path `user_id`, `contact_id` | `UserPublic` |
| GET | `/api/users/{user_id}/properties` | Properties assigned to user | Path `user_id` | `List[PropertyPublic]` |
| POST | `/api/users/{user_id}/properties/{property_id}` | Assign property | Path `user_id`, `property_id` | `UserPublicWithProperties` |
| DELETE | `/api/users/{user_id}/properties/{property_id}` | Remove property assignment | Path `user_id`, `property_id` | `UserPublicWithProperties` |

**Important validations**
- Username must be unique; duplicate attempts return 400.
- Linking operations fail with 404 when either side is missing.

---

## Contacts (`/api/contacts`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/contacts/` | Create contact | JSON: `first_name` (required), optional `last_name`, `email`, `phone` | `ContactPublic` |
| GET | `/api/contacts/` | List contacts | Query: `skip`, `limit` | `List[ContactPublic]` |
| GET | `/api/contacts/{contact_id}` | Get contact | Path `contact_id` | `ContactPublic` |
| PUT | `/api/contacts/{contact_id}` | Update contact | JSON: any of `first_name`, `last_name`, `email`, `phone` | `ContactPublic` |
| DELETE | `/api/contacts/{contact_id}` | Delete contact | Path `contact_id` | 204 No Content |

---

## Addresses (`/api/addresses`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/addresses/` | Create address | JSON: `street_1`, `city`, `state`, `zipcode`; optional `street_2`, `lat`, `long` | `AddressPublic` |
| GET | `/api/addresses/` | List addresses | Query: `skip`, `limit` | `List[AddressPublic]` |
| GET | `/api/addresses/{address_id}` | Get address | Path `address_id` | `AddressPublic` |
| PUT | `/api/addresses/{address_id}` | Update address | JSON: any address fields | `AddressPublic` |
| DELETE | `/api/addresses/{address_id}` | Delete address | Path `address_id` | 204 No Content |

---

## Properties (nested under address)

Routes are prefixed with `/api/addresses/{address_id}/properties`.

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/addresses/{address_id}/properties/` | Create property for address | JSON: `property_name` (required), optional `mls_number`, `notes` | `PropertyPublic` |
| GET | `/api/addresses/{address_id}/properties/` | List properties for address | Query: `skip`, `limit` | `List[PropertyPublic]` |
| GET | `/api/addresses/{address_id}/properties/{property_id}` | Get property | Path `address_id`, `property_id` | `PropertyPublic` |
| PUT | `/api/addresses/{address_id}/properties/{property_id}` | Update property | JSON: any of `property_name`, `mls_number`, `notes`, `lead_id` | `PropertyPublic` |
| DELETE | `/api/addresses/{address_id}/properties/{property_id}` | Delete property | Path `address_id`, `property_id` | 204 No Content |

---

## Units (nested under property)

Routes are prefixed with `/api/properties/{property_id}/units`.

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/properties/{property_id}/units/` | Create unit | JSON: any of `apt_num`, `bedrooms`, `bath`, `sqft`, `notes` | `UnitPublic` |
| GET | `/api/properties/{property_id}/units/` | List units | Query: `skip`, `limit` | `List[UnitPublic]` |
| GET | `/api/properties/{property_id}/units/{unit_id}` | Get unit | Path `property_id`, `unit_id` | `UnitPublic` |
| PUT | `/api/properties/{property_id}/units/{unit_id}` | Update unit | JSON: any unit fields | `UnitPublic` |
| DELETE | `/api/properties/{property_id}/units/{unit_id}` | Delete unit | Path IDs | 204 No Content |

---

## Leads (`/api/leads`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/leads/` | Create lead | JSON: optional `person_type`, `business`, `website`, `license_num`, `notes` | `LeadPublic` |
| GET | `/api/leads/` | List leads | Query: `skip`, `limit` | `List[LeadPublic]` (includes nested relationships) |
| GET | `/api/leads/{lead_id}` | Get lead | Path `lead_id` | `LeadPublic` |
| PUT | `/api/leads/{lead_id}` | Update lead | JSON: same fields as create | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}` | Delete lead | Path `lead_id` | 204 No Content |

### Lead Linking Shortcuts

| Method | Path | Purpose | Response |
| --- | --- | --- | --- |
| POST | `/api/leads/{lead_id}/properties/{property_id}` | Attach property to lead | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/properties/{property_id}` | Remove property from lead | `LeadPublic` |
| POST | `/api/leads/{lead_id}/users/{user_id}` | Attach owner/agent | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/users/{user_id}` | Remove owner/agent | `LeadPublic` |
| POST | `/api/leads/{lead_id}/contacts/{contact_id}` | Attach contact | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/contacts/{contact_id}` | Remove contact | `LeadPublic` |
| POST | `/api/leads/{lead_id}/addresses/{address_id}` | Attach address | `LeadPublic` |
| DELETE | `/api/leads/{lead_id}/addresses/{address_id}` | Remove address | `LeadPublic` |

All linking endpoints return the refreshed lead payload (same as `GET /api/leads/{lead_id}`) and issue 404 when either side is missing.

---

## Campaigns (`/api/campaigns`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/campaigns/` | Create campaign | JSON: `campaign_name` (required), `user_id` (required), optional `property_id` | `CampaignPublic` |
| GET | `/api/campaigns/` | List campaigns | Query: `skip`, `limit` | `List[CampaignPublic]` |
| GET | `/api/campaigns/{campaign_id}` | Get campaign | Path `campaign_id` | `CampaignPublic` |
| PUT | `/api/campaigns/{campaign_id}` | Update campaign | JSON: any of `campaign_name`, `user_id`, `property_id` | `CampaignPublic` |
| DELETE | `/api/campaigns/{campaign_id}` | Delete campaign | Path `campaign_id` | 204 No Content |

---

## Campaign Messages (`/api/campaign-messages`)

| Method | Path | Purpose | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/campaign-messages/` | Create campaign message | JSON: `campaign_id` (required), optional `lead_id`, `contact_method` (`phone`/`sms`/`email`), `message_subject`, `message_body` | `CampaignMessagePublic` |
| GET | `/api/campaign-messages/` | List messages (global) | Query: `skip`, `limit`, optional `campaign_id` | `List[CampaignMessagePublic]` |
| GET | `/api/campaign-messages/{message_id}` | Get message | Path `message_id` | `CampaignMessagePublic` |
| PUT | `/api/campaign-messages/{message_id}` | Update message | JSON: any of `lead_id`, `contact_method`, `message_subject`, `message_body` | `CampaignMessagePublic` |
| DELETE | `/api/campaign-messages/{message_id}` | Delete message | Path `message_id` | 204 No Content |
| GET | `/api/campaign-messages/campaign/{campaign_id}` | Messages for a campaign | Query: `skip`, `limit`, optional `contact_method` (filters by exact method) | `List[CampaignMessagePublic]` |

`contact_method` values must be one of `phone`, `sms`, or `email`.

---

## CSV Intake (`/api/import-csv/`)

| Method | Path | Purpose | Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/import-csv/` | Upload CSV/XLSX of contacts/leads | `multipart/form-data` with file field `file` | Summary with counts and lists: created/updated contacts & leads, skipped rows, errors |

Allowed file MIME types: `text/csv`, `application/vnd.ms-excel`, and `.xlsx`. The backend normalizes headers (snake_case, lowercase) and merges rows by email/phone.

---

## Lead Search (`/api/searchLeads`)

| Method | Path | Purpose | Body Fields | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/searchLeads` | Fan-out search across one or more data sources | `location_text` (string) plus `sources` (array containing any of `"db"`, `"rapidapi"`, `"google_places"`, `"gpt"`) | Per-source `results` (each with `leads` and optional metadata) and per-source `errors` when a provider fails |

Notes:
- When a single source is requested, the matching entry in `results` mirrors the legacy payloads (for example, `rapidapi`/`google_places`/`gpt`/`db` return `leads` with `distance_miles`).
- If geocoding fails or a provider rejects the request, the reason is listed under `errors[source]`.
- `location_text` can be a zip code or free-form description; the backend geocodes and extracts any dynamic filters automatically.
- Leads returned from external sources include a temporary positive `lead_id` so frontends can key list items consistently; IDs increment across sources within the same response.
- External provider quotas: RapidAPI requests reset monthly with a cap of 95 calls, and Brave search requests (used by the GPT integration) are limited to 1,950 calls per month.

---

### Usage Tips for Frontend Developers

- Always hit the `/api` prefixed route (e.g., `/api/leads`), even when an endpoint is described relative to a resource group.
- For create/update forms, supply only the fields marked required; optional fields can be omitted rather than sent as `null`.
- Use the linking endpoints instead of including relationship IDs in create payloads—this keeps flows simple and mirrors backend expectations.
- Most GET endpoints support `skip`/`limit` pagination; keep them in query strings even if you default to `skip=0&limit=100`.

