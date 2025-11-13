import type { IContact } from "../../interfaces";

export const contactFullName = (contact?: IContact) =>
  `${contact?.firstName} ${contact?.lastName}`.trim();
