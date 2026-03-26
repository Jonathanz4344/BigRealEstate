import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import type { ITeamAnnouncement } from "../../interfaces";
import { AnnouncementCard, OverflowText } from "..";
import { useFireIfExists } from "../../hooks";
import { forwardRef } from "react";

type DashboardAnnouncementsCardProps = DashboardCardProps & {
  messages: ITeamAnnouncement[];
  overflowCount: number;
  onClick?: (messageId: number) => void;
  onTrash?: (messageId: number) => void;
  onEdit?: (messageId: number) => void;
};

export const DashboardAnnouncementsCard = forwardRef<
  HTMLDivElement,
  DashboardAnnouncementsCardProps
>((props, ref) => {
  const { messages, overflowCount, onClick, onTrash, onEdit } = props;
  const fireIfExists = useFireIfExists();
  return (
    <DashboardCard ref={ref} {...props}>
      <div className="w-full flex flex-col gap-y-3.75">
        <div className="flex flex-col gap-y-7.5">
          {messages.map((message) => (
            <AnnouncementCard
              key={message.announcement_id}
              message={message}
              onClick={fireIfExists(message.announcement_id, onClick)}
              onTrash={fireIfExists(message.announcement_id, onTrash)}
              onEdit={fireIfExists(message.announcement_id, onEdit)}
            />
          ))}
        </div>

        <OverflowText overflowCount={overflowCount} />
      </div>
    </DashboardCard>
  );
});
