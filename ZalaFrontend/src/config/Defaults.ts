import type { ICampaign, IKanbanBoard } from "../interfaces";

const DEFAULT_CAMPAIGN: ICampaign = {
  campaignId: 0,
  userId: 0,
  campaignName: "",
  leads: [],
};

const DEFAULT_BOARD_STEPS = {
  SE: ["To Do", "In Progress", "Review", "Done", "Backlog"],
  RE: ["Selling", "In Progress", "Paperwork", "Sold"],
};

const DEFAULT_BOARD: IKanbanBoard = {
  boardId: 0,
  boardName: "New Board",
  boardSteps: DEFAULT_BOARD_STEPS.SE.map((v, i) => ({
    boardId: 0,
    boardColumn: i,
    boardStepId: i,
    leads: [],
    properties: [],
    stepName: v,
  })),
  boardType: "lead",
};

export const DEFAULTS = {
  campaign: DEFAULT_CAMPAIGN,
  board: DEFAULT_BOARD,
  boardSteps: DEFAULT_BOARD_STEPS,
};
