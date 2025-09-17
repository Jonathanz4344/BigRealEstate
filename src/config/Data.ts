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
const Progress00: IFourUpItem = {
  title:[Assignee.Niccolls],
  content:
    "Moved project to gh pages and setup online presence",
};
const Progress01: IFourUpItem = {
  title:[Assignee.Colin],
  content:
    "Designed and implemented project website landing page",
};
const Progress02: IFourUpItem = {
  title:[Assignee.Colin, Assignee.Jonathan],
  content:
    "Designed UI/UX of other pages (4UPs, Weekly Hours … )",
};
const Progress03: IFourUpItem = {
  title:[Assignee.Team],
  content:
    "Generated clarifying questions on the project to ensure we understand the sponsor",
};
const Progress04: IFourUpItem = {
  title:[Assignee.Robert],
  content:
    "Created discord and facilitated team’s communication channels ",
};
const Progress05: IFourUpItem = {
  title:[Assignee.Colin, Assignee.Jonathan],
  content:
    "Implemented display 4UPs on project",
};
const Progress06: IFourUpItem = {
 title:[Assignee.Colin, Assignee.Jonathan],
  content:
    "Implemented display hours on project",
};
const Progress07: IFourUpItem = {
  title:[Assignee.Team],
  content:
    "Discussed and made initial plans for data collection and AI integration",
};
const Progress08: IFourUpItem = {
  title:[Assignee.Andrew],
  content:
    "Researched regulations related to data collection and possible sources of data for lead generation ",
};
const Progress09: IFourUpItem = {
  title:[Assignee.Team],
  content:
    "Collected screenshots from popular applications to brainstorm UI design",
};

const Progress11: IFourUpItem = {
  title:[Assignee.Andrew],
  content:
    "Researched data laws in different countries, then focused on US law",
};
const Progress12: IFourUpItem = {
  title: [Assignee.Jonathan],
  content:
    "Found website for real estate information in Miami, other research on data collection methods ",
};
const Progress13: IFourUpItem = {
  title: [Assignee.Robert],
  content:
    "Research into how to get new leads and complement leads",
};
const Progress14: IFourUpItem = {
  title: [Assignee.Colin],
  content:
    "Compiled email to send to sponsor and research into data sources for lead generation",
};
const Progress15: IFourUpItem = {
  title: [Assignee.Niccolls],
  content:
    "Watched zoom recording and brainstormed how to construct an MVP",
};

const Plan01: IFourUpItem = {
  title: [Assignee.Team],
  content: "Homepage",
};
const Plan02: IFourUpItem = {
  title: [Assignee.Team],
  content: "Communicate UI research & ideas for fuzzier features",
};

const Plan11: IFourUpItem = {
  title: [Assignee.Andrew],
  content: "Create Spike for Data Collection Regulation Compliance",
};
const Plan12: IFourUpItem = {
  title: [Assignee.Jonathan],
  content: "Create Spike for researching data collection APIs",
};
const Plan13: IFourUpItem = {
  title: [Assignee.Colin],
  content: "Send email to sponsor with UI screenshots",
};
const Plan14: IFourUpItem = {
  title: [Assignee.Robert],
  content: "Create first draft of project synopsis ",
};
const Plan15: IFourUpItem = {
  title: [Assignee.Colin],
  content: "From list of data sources, what is the pricing like and what kind of data can we get",
};
const Plan16: IFourUpItem = {
  title: [Assignee.Andrew, Assignee.Robert, Assignee.Jonathan],
  content: "More research on data collection ",
};
const Plan17: IFourUpItem = {
  title: [Assignee.Team],
  content: "Present sponsor with ideas for AI integration",
};
const Plan18: IFourUpItem = {
  title:[Assignee.Niccolls],
  content: "Get an MVP going and clearly define requirements ",
};
const Plan19: IFourUpItem = {
  title: [Assignee.Team],
  content: "Review slide deck from sponsor",
};

const Risk01: IFourUpItem = {
   title: [Assignee.Team],
  content: "Make sure we’re building the right thing, miscommunication between sponsor and dev team can lead to the development of the wrong product. This would be a major setback in both time and energy. To mitigate, we should extensively clarify whether we understand precisely what the sponsor wants before advancing to development, and share progress weekly with the sponsor to get active feedback on how we could improve."
};
const Risk11: IFourUpItem = {
   title: [Assignee.Team],
  content: "Breaking laws for data privacy could cause legal issues"
};
const Risk12: IFourUpItem = {
   title: [Assignee.Team],
  content: "Locking down scope and mvp",
};
const Risk13: IFourUpItem = {
   title: [Assignee.Team],
  content: "API usage costs",
};

const Need01: IFourUpItem = {
  title: [Assignee.Team],
  content: "Clarification on project scope & features wanted",
};
const Need11: IFourUpItem = {
  title: [Assignee.Team],
  content: "Find out which region’s regulations we should focus on according to Sponsor",
};
const Need12: IFourUpItem = {
  title: [Assignee.Team],
  content: "Do we want some leads to be real estate agents who can put us in contact with other leads?",
};
const Need13: IFourUpItem = {
  title: [Assignee.Team],
  content: "What to do about legal issues with data collection? Should we plan for purchasing leads?",
};

export const Data: IData = {
  fourUps: [
    {
      id: 2,
      dateRange: "09/11/25 - 09/17/25",
      progress: [Progress11,Progress12,Progress13,Progress14,Progress15],
      plans: [Plan11,Plan12,Plan13,Plan14,Plan15,Plan16,Plan17,Plan18,Plan19],
      needs: [Need11, Need12, Need13],
      risks: [Risk11, Risk12,Risk13],
    },
    {
      id: 1,
      dateRange: "08/28/25 - 09/11/25",
      progress: [Progress00, Progress01,Progress02,Progress03,Progress04,Progress05,Progress06,Progress07,Progress08,Progress09],
      plans: [Plan01, Plan02],
      needs: [Need01],
      risks: [Risk01],
    },
  ],

  // Put all hours here
  hours: [
    {
      date: "09/16/25",
      hours: { Andrew: 2, Robert: 2, Colin: 2, Niccolls: 2, Jonathan: 2 },
    },
    {
      date: "09/14/25",
      hours: { Andrew: 2, Robert: 2, Colin: 2, Niccolls: 2, Jonathan: 2 },
    },
    {
      date: "09/11/25",
      hours: { Andrew: 4, Robert: 4, Colin: 4, Niccolls: 4, Jonathan: 4 },
    },
    {
      date: "09/09/25",
      hours: { Andrew: 2, Robert: 2, Colin: 2, Niccolls: 2, Jonathan: 2 },
    },
    {
      date: "09/07/25",
      hours: { Andrew: 2, Robert: 2, Colin: 2, Niccolls: 2, Jonathan: 2 },
    },
    {
      date: "09/04/25",
      hours: { Andrew: 2, Robert: 2, Colin: 2, Niccolls: 2, Jonathan: 2 },
    },
    {
      date: "09/02/25",
      hours: { Andrew: 2, Robert: 2, Colin: 2, Niccolls: 2, Jonathan: 2 },
    },
  ],
};
