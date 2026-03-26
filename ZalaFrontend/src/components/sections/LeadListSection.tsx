import clsx from "clsx";
import type { ILead, ISourceResult } from "../../interfaces";
import { LeadCard, type LeadCardProps } from "../cards";
import { Button, type ButtonProps } from "../buttons";
import { Loader } from "../feedback";
import { COLORS } from "../../config";
import { forwardRef } from "react";

type LeadListSectionProps = {
  leads: ILead[] | ISourceResult<ILead>[];
  animated?: boolean;
  animationTrigger?: boolean;
  title?: string;
  footerBtn?: ButtonProps;
  loading?: boolean;
  disableScroll?: boolean;
  getLeadProps: (
    lead: ILead,
    i: number,
  ) => Omit<Omit<LeadCardProps, "i">, "lead">;
};

export const LeadListSection = forwardRef<HTMLDivElement, LeadListSectionProps>(
  (
    {
      leads,
      title,
      animated,
      animationTrigger,
      footerBtn,
      loading = false,
      disableScroll = false,
      getLeadProps,
    },
    ref,
  ) => {
    const showLeads = animated ? animationTrigger : true;

    return (
      <div
        ref={ref}
        className={clsx(
          "flex flex-col h-full py-15",
          "transition-[flex] duration-250",
          "bg-background",
          showLeads ? "flex-[.4]" : "flex-0",
        )}
      >
        <div className="relative h-full flex-1">
          <div
            className={clsx(
              "absolute top-0 left-0 w-full h-full",
              disableScroll ? "overflow-hidden" : "overflow-scroll",
              "transition-transform duration-1000 delay-100",
              showLeads ? "translate-y-0" : "translate-y-[-150%]",
            )}
          >
            <div className="relative h-full w-full">
              {showLeads && title && (
                <span className="block sticky top-0 z-1 bg-background w-full text-center text-base pb-1.25">
                  {title}
                </span>
              )}
              <div className="w-full flex flex-col space-y-7.5 py-7.5 pl-7.5 pr-15  ">
                {leads.map((lead, i) => {
                  const props = getLeadProps(lead, i);
                  return (
                    <LeadCard
                      key={lead.leadId}
                      i={i}
                      lead={lead}
                      active={props.active}
                      onTitleClick={props.onTitleClick}
                      button={props.button}
                    />
                  );
                })}
              </div>
              <div className="h-25" />
            </div>
          </div>

          {footerBtn && showLeads && (
            <div
              className={clsx(
                "absolute bottom-0 left-0 z-1 w-full flex justify-center p-3.75 bg-background pb-0 bg-green!",
                "transition-transform duration-1000 delay-100",
                showLeads ? "translate-y-0" : "translate-y-[-150%]",
              )}
            >
              <Button {...footerBtn} />
            </div>
          )}

          {loading && showLeads && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm"
              style={{ backgroundColor: `${COLORS.background}cc` }}
            >
              <Loader darkMode />
            </div>
          )}
        </div>
      </div>
    );
  },
);
