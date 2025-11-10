import type { IContact, ILead, ISourceResult } from "../../interfaces";
import type { IAddress } from "../../interfaces/Address";

const contact = (data: never): IContact => {
  return {
    contactId: data["contact_id"],
    firstName: data["first_name"],
    lastName: data["last_name"],
    email: data["email"],
    phone: data["phone"],
  };
};

const address = (data: never): IAddress => {
  return {
    addressId: data["address_id"],
    street1: data["street_1"],
    street2: data["street_2"],
    city: data["city"],
    state: data["state"],
    zipcode: data["zipcode"],
    lat: data["lat"],
    long: data["long"],
  };
};

const lead = (data: never): ILead => {
  return {
    leadId: data["lead_id"],
    licenseNum: data["license_num"],

    contact: contact(data["contact"]),
    address: address(data["address"]),

    buisness: data["business"], // Note: Typo on API side ?
    website: data["website"],
    notes: data["notes"],
    // properties: data["properties"],
    // campaigns: data["campaigns"],
  };
};

const sourceResult = <T>(data: never, result: T): ISourceResult<T> => {
  return {
    ...result,
    distanceMiles: data["distance_miles"],
    source: data["source"],
  };
};

export const APINormalizer = {
  lead,
  sourceResult,
};
