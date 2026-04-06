import { TextPlacement } from "../stores";

// Keys must be values of TutorialPage enum lowercased
export const TutorialText = {
  dashboard: [
    "This is your dashboard! It is the central location for viewing and managing your team, your leads, and your properties.",
    "This is your team name. Admins can change the team name by editing the text box.",
    "These are all the admins on your team. Admins have extra permissions such as renaming the team and removing team members or properties.",
    "Invited members are individuals who have been invited to the team, but have not yet joined.",
    "These are all the members on your team.",
    "Announcements are a way for admins to display messages for the team.",
    "The team leaderboard ranks team members by the XP they have from deals. Close more deals than your colleagues to top the leaderboard!",
    "This is where your personal properties can be viewed. These will not be visible to your team members unless you add them to your team's properties.",
    "Team properties are viewable by all team members, but can only be edited by admins or the creator of the property card.",
    "Just like with properties, boards can be personal or shared with a team. All boards you create will be shown under 'My Boards', and can be added to the team boards with the + button.",
    "Want to explore more of ZLA now? Next up: Finding New Leads!",
  ], // 11
  navbar: [
    "Type a location in the search bar to find leads from that area! Go ahead and give it a try.",
  ],
  search: [
    "This is your map page. The locations of leads and properties will be shown here, and you can add them to campaigns or boards from the map.",
    "Leads can be added to a campaign individually, or you can add all the results of your search with the 'Add all leads' button.",
    "Add a title and click 'Start' to create a campaign with your selected leads!",
  ],
  board: [
    "A board is used to track progress of pursuing leads or selling properties.",
    "Admins of a team board or creators of a board can edit board settings, delete a board, or change the title of a board.",
    "This is where you can modify properties of your board like the name or the type of board.",
    'A board contains a series of steps that leads or properties must progress through to get to the end goal. For example, a lead may start as a "New Lead", then progress to "Contact Made", then "Sale Closed". You can add an item to the board with the + button under a step, then drag the item to move it to different steps.',
  ],
  campaign: [
    "With a campaign, you can store information about leads and manage your communications with them.",
    "Multiple selected leads can be emailed with the “Email All” button if there are selected leads with known emails.",
    "You can track how you’ve reached out to a lead by clicking the contact options here.",
    "You can leave miscellaneous notes on a lead here.",
    "All known information about a lead is shown here.",
  ],
};

export type TutorialTextKey = keyof typeof TutorialText;

export const TutorialSequence = {
  dashboard: [
    "modal",
    "component",
    "component",
    "component",
    "component",
    "component",
    "component",
    "component",
    "component",
    "component",
    "modal",
  ],
  navbar: ["component"],
  search: ["modal", "component", "component"],
  board: ["modal", "component", "component", "component"],
  campaign: ["modal", "component", "component", "component", "component"],
};

export const TutorialSequenceMaximums = {
  dashboard: TutorialText.dashboard.length - 1,
  navbar: TutorialText.navbar.length - 1,
  search: TutorialText.search.length - 1,
  board: TutorialText.board.length - 1,
  campaign: TutorialText.campaign.length - 1,
};

export const TutorialTextPlacements = {
  dashboard: [
    TextPlacement.Modal,
    TextPlacement.Bottom,
    TextPlacement.Right,
    TextPlacement.Left,
    TextPlacement.Top,
    TextPlacement.Right,
    TextPlacement.Left,
    TextPlacement.Left, // Properties
    TextPlacement.Right,
    TextPlacement.Top,
    TextPlacement.Modal,
  ],
  navbar: [TextPlacement.Bottom],
  search: [TextPlacement.Top, TextPlacement.Left, TextPlacement.Right],
  board: [
    TextPlacement.Modal,
    TextPlacement.Bottom,
    TextPlacement.Bottom,
    TextPlacement.Top,
  ],
  campaign: [
    TextPlacement.Top,
    TextPlacement.Top,
    TextPlacement.Bottom,
    TextPlacement.Top,
    TextPlacement.Top,
  ],
};
