import { AContactToIContact, type AContact, type IContact } from "./contact";

export type IUser = {
  username: string;
  profilePic: string;
  role: string;
  userId: number;
  contact?: IContact;
  xp: number;
};

export type AUser = {
  username: string;
  profile_pic: string;
  role: string;
  user_id: number;
  contact?: AContact;
  xp: number;
};

export const AUserToIUser = (body: AUser): IUser => ({
  username: body.username,
  profilePic: body.profile_pic,
  role: body.role,
  userId: body.user_id,
  contact: body.contact ? AContactToIContact(body.contact) : undefined,
  xp: body.xp,
});
