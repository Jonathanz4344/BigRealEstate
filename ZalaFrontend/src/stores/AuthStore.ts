import { create } from "zustand";
import type { IUser } from "../interfaces";

type IAuthStore = {
  user?: IUser;
  setUser: (user?: IUser) => void;
};

export const useAuthStore = create<IAuthStore>()((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}));
