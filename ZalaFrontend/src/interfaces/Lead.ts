import { AAddressToIAddress, type AAddress, type IAddress } from "./Address";
import { type AContact, type IContact, AContactToIContact } from "./contact";
import { AImageToIImage, type AImage, type IImage } from "./Image";
import { AUserToIUser, type AUser, type IUser } from "./user";

export type ALead = {
  lead_id: number;
  created_by: number;
  contact_id: number;
  address_id: number;

  person_type: "person" | "business"; // could extend if needed

  business: string;
  website: string;
  license_num: string;
  notes: string;

  contact: AContact;
  address: AAddress;

  image_url?: string | null;
  images?: AImage[];

  properties: never[]; // Not sure these are needed in response from api
  campaigns: never[]; // Not sure these are needed in response from api

  created_by_user: AUser;
};

export type ILead = {
  personType: "person" | "business";
  leadId: number;

  buisness: string;
  website: string;
  licenseNum: string;
  notes: string;

  contact?: IContact;
  address?: IAddress;

  imageUrl?: string;
  images?: IImage[];

  createdBy?: number;
  createdByUser?: IUser;
};

export const ALeadToILead = (body: ALead): ILead => ({
  leadId: body.lead_id,
  personType: body.person_type ?? "person",
  buisness: body.business ?? "",
  website: body.website ?? "",
  licenseNum: body.license_num ?? "",
  notes: body.notes ?? "",
  imageUrl: body.image_url ?? undefined,
  images: body.images ? body.images.map(AImageToIImage) : undefined,
  createdBy: body.created_by ?? undefined,
  createdByUser: body.created_by_user
    ? AUserToIUser(body.created_by_user)
    : undefined,
  contact: body.contact ? AContactToIContact(body.contact) : undefined,
  address: body.address ? AAddressToIAddress(body.address) : undefined,
});
