import type { PropsWithChildren } from "react";

type LeadTitleValueProps = {
  title: string;
  value?: string;
};

export const LeadTitleValue = ({
  title,
  value,
  children,
}: PropsWithChildren<LeadTitleValueProps>) => {
  return (
    <div>
      <p className="text-base">{title}</p>
      {value && <p className="text-base text-secondary-50">{value}</p>}
      {children}
    </div>
  );
};
