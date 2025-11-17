import type { AContact } from "./contact";

export type BoardSummary = {
  board_id: number;
  board_name: string;
  user_id?: number | null;
  user?: {
    user_id: number;
    username?: string | null;
    profile_pic?: string | null;
  } | null;
};

export type LeadCard = {
  lead_id: number;
  person_type?: string | null;
  business?: string | null;
  website?: string | null;
  license_num?: string | null;
  notes?: string | null;
  created_by?: number | null;
  created_by_user?: {
    user_id: number;
    username?: string | null;
  } | null;
  contact?: AContact | null;
  address?: {
    street_1?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
  } | null;
};

export type PropertyCard = {
  property_id: number;
  property_name: string;
  mls_number?: string | null;
  notes?: string | null;
  address_id?: number | null;
  address?: {
    street_1?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
  } | null;
};

export type BoardStepCard = {
  board_step_id: number;
  board_id: number;
  board_column: number;
  step_name: string;
  board?: BoardSummary;
  leads: LeadCard[];
  properties: PropertyCard[];
};

export type KanbanBoard = BoardSummary & {
  board_steps: BoardStepCard[];
};
