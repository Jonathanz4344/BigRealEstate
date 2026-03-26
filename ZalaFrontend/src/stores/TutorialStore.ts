import { create } from "zustand";
import type { ITutorial } from "../interfaces";

export enum TutorialPage {
  Dashboard = "Dashboard",
  Navbar = "Navbar",
  Search = "Search",
  Campaign = "Campaign",
  Board = "Board",
}

type ITutorialStore = {
  page: TutorialPage;
  tutorial?: ITutorial;

  setPage: (page: TutorialPage) => void;
  setTutorial: (tutorial?: ITutorial) => void;
};

export const useTutorialStore = create<ITutorialStore>()((set) => ({
  page: TutorialPage.Dashboard,
  tutorial: undefined,

  setPage: (page) => set({ page }),
  setTutorial: (tutorial) => set({ tutorial }),
}));
