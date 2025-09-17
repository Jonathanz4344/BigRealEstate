import type { IFourUpItem } from "../../interfaces";
import { Assignee } from "../../interfaces";

type FourUpTextProps = {
  item: IFourUpItem;
};

// Helper function to get initials from assignee name
const getInitials = (assignee: Assignee): string => {
  if (assignee === Assignee.Team) return "T";
  
  return assignee
    .split(" ")
    .map(name => name[0])
    .join("");
};

// Helper function to check if assignee is Team
const isTeamAssignee = (assignee: Assignee): boolean => {
  return assignee === Assignee.Team;
};

// Component for individual items
export const FourUpText = ({ item }: FourUpTextProps) => {
  return (
    <div className="flex items-start gap-4 mb-4">
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
        {item.title.map((assignee, index) => (
          <span
            key={index}
            className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full border shadow-sm ${
              isTeamAssignee(assignee)
                ? "text-black bg-yellow-400 border-yellow-500" // Team styling
                : "text-white bg-white/25 border-white/40"      // Individual styling
            }`}
            title={assignee} // Tooltip shows full name on hover
          >
            {getInitials(assignee)}
          </span>
        ))}
      </div>
      <div className="flex-1 text-white text-sm leading-relaxed pt-0.5">
        {item.content}
      </div>
    </div>
  );
};