export type IContact = {
  contactId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type AContact = {
  contact_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export const AContactToIContact = (body: AContact): IContact => ({
  contactId: body.contact_id,
  firstName: body.first_name,
  lastName: body.last_name,
  email: body.email,
  phone: body.phone,
});
