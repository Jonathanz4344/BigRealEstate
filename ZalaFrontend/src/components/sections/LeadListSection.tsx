import clsx from "clsx";
import type { DemoData } from "../../interfaces";
import { LeadCard, type LeadCardProps } from "../cards";
import { Button, type ButtonProps } from "../buttons";

type LeadListSectionProps = {
  leads: DemoData[];
  animated?: boolean;
  animationTrigger?: boolean;
  title?: string;
  footerBtn?: ButtonProps;
  getLeadProps: (
    lead: DemoData,
    i: number
  ) => Omit<Omit<LeadCardProps, "i">, "lead">;
};

export const LeadListSection = ({
  leads,
  title,
  animated,
  animationTrigger,
  footerBtn,
  getLeadProps,
}: LeadListSectionProps) => {
  const showLeads = animated ? animationTrigger : true;
  return (
    <div
      className={clsx(
        "flex flex-col h-full py-[60px]",
        "transition-[flex] duration-250",
        showLeads ? "flex-[.4]" : "flex-0"
      )}
    >
      <div className="relative h-full flex-1">
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full overflow-scroll",
            "transition-transform duration-1000 delay-100",
            showLeads ? "translate-y-0" : "translate-y-[-150%]"
          )}
        >
          <div className="relative h-full w-full">
            {showLeads && title && (
              <span className="block sticky top-0 z-1 bg-background w-full text-center text-base pb-[5px]">
                {title}
              </span>
            )}
            <div className="w-full flex flex-col space-y-[30px] py-[30px] pl-[30px] pr-[60px]  ">
              {leads.map((lead, i) => {
                const props = getLeadProps(lead, i);
                return (
                  <LeadCard
                    key={i}
                    i={i}
                    lead={lead}
                    active={props.active}
                    onTitleClick={props.onTitleClick}
                    button={props.button}
                  />
                );
              })}
            </div>
            <div className="h-[100px]" />
          </div>
        </div>

        {footerBtn && (
          <div
            className={clsx(
              "absolute bottom-0 left-0 z-1 w-full flex justify-center p-[15px] bg-background pb-0",
              "transition-transform duration-1000 delay-100",
              showLeads ? "translate-y-0" : "translate-y-[-150%]"
            )}
          >
            <Button {...footerBtn} />
          </div>
        )}
      </div>
    </div>
  );
};
