import { Assignee } from "../interfaces";

export type IFourUp = {
  id: number;
  dateRange: string;
  progress: IFourUpItem[];
  plans: IFourUpItem[];
  needs: IFourUpItem[];
  risks: IFourUpItem[];
};

export type IFourUpItem = {
  title: Assignee[];
  content: string;
};
