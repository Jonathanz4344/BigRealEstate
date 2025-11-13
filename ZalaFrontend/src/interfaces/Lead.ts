import type { AAddress, IAddress } from "./Address";
import type { AContact, IContact } from "./contact";
import type { AUser } from "./User";

export type ALead = {
  person_type: "person" | "business"; // could extend if needed
  business: string;
  website: string;
  license_num: string;
  notes: string;
  lead_id: number;
  created_by: number;
  contact_id: number;
  address_id: number;
  created_by_user: AUser;
  contact: AContact;
  address: AAddress;
  properties: never[]; // Not sure these are needed in response from api
  campaigns: never[]; // Not sure these are needed in response from api
};

export type ILead = {
  leadId: number;
  licenseNum: string;

  contact: IContact;
  address: IAddress;

  buisness: string;
  website: string;

  notes: string;
  // properties: number[];
  // campaigns: number[];

  createdBy?: number;
};

// export
