import {
  Assignee,
  type IDayHour,
  type IFourUp,
  type IFourUpItem,
} from "../interfaces";

type IData = {
  fourUps: IFourUp[];
  hours: IDayHour[];
};

const DefaultProg1: IFourUpItem = {
  title: Assignee.Andrew,
  content:
    "The progress of this week is that we have completed a figma file and talked with our sponsor",
};
const DefaultProg2: IFourUpItem = {
  title: Assignee.Robert,
  content:
    "The progress of this week is that we have completed a figma file and talked with our sponsor",
};

const DefaultPlan1: IFourUpItem = {
  title: Assignee.Andrew,
  content: "Define project scope and timeline",
};
const DefaultPlan2: IFourUpItem = {
  title: Assignee.Robert,
  content: "Set up project management tools",
};

const DefaultNeed1: IFourUpItem = {
  title: "Need 1",
  content: "Access to development environment",
};
const DefaultNeed2: IFourUpItem = {
  title: "Need 2",
  content: "Project kickoff meeting completed",
};

const DefaultRisk1: IFourUpItem = {
  title: "Risk 1",
  content: "Unclear requirements from stakeholders",
};
const DefaultRisk2: IFourUpItem = {
  title: "Risk 2",
  content: "Resource allocation conflicts",
};

export const Data: IData = {
  fourUps: [
    {
      id: 3,
      dateRange: "09/23/25 - 09/30/25",
      progress: [DefaultProg1, DefaultProg2],
      plans: [DefaultPlan1, DefaultPlan2],
      needs: [DefaultNeed1, DefaultNeed2],
      risks: [DefaultRisk1, DefaultRisk2],
    },
    {
      id: 2,
      dateRange: "09/16/25 - 09/22/25",
      progress: [DefaultProg1, DefaultProg2],
      plans: [DefaultPlan1, DefaultPlan2],
      needs: [DefaultNeed1, DefaultNeed2],
      risks: [DefaultRisk1, DefaultRisk2],
    },
    {
      id: 1,
      dateRange: "09/09/25 - 09/15/25",
      progress: [DefaultProg1, DefaultProg2],
      plans: [DefaultPlan1, DefaultPlan2],
      needs: [DefaultNeed1, DefaultNeed2],
      risks: [DefaultRisk1, DefaultRisk2],
    },
  ],

  // Put all hours here
  hours: [
    {
      date: "09/30/25",
      hours: { Andrew: 8, Robert: 4, Colin: 3, Niccolls: 4, Jonathan: 3 },
    },
    {
      date: "09/29/25",
      hours: { Andrew: 2, Robert: 2, Colin: 1, Niccolls: 5, Jonathan: 2 },
    },
    {
      date: "09/28/25",
      hours: { Andrew: 1, Robert: 3, Colin: 4, Niccolls: 2, Jonathan: 4 },
    },
    {
      date: "09/27/25",
      hours: { Andrew: 2, Robert: 5, Colin: 5, Niccolls: 3, Jonathan: 5 },
    },
    {
      date: "09/26/25",
      hours: { Andrew: 4, Robert: 4, Colin: 2, Niccolls: 5, Jonathan: 3 },
    },
    {
      date: "09/25/25",
      hours: { Andrew: 3, Robert: 3, Colin: 3, Niccolls: 3, Jonathan: 2 },
    },
    {
      date: "09/24/25",
      hours: { Andrew: 5, Robert: 2, Colin: 4, Niccolls: 1, Jonathan: 5 },
    },
    {
      date: "09/23/25",
      hours: { Andrew: 5, Robert: 4, Colin: 3, Niccolls: 4, Jonathan: 3 },
    },
  ],
};
