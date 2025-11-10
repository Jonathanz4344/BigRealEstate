import type { IAddress } from "./Address";
import type { IContact } from "./contact";

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
