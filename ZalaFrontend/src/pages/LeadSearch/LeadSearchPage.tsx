import {
  IconButton,
  IconButtonVariant,
  Icons,
  LeadListSection,
  Map,
} from "../../components";
import { useLeadSearchPage } from "../../hooks";
import { SideNavControlVariant } from "../../stores";
import clsx from "clsx";
import { CampaignCard } from "./components";

export const LeadSearchPage = () => {
  const {
    showLeads,
    openSideNav,
    campaignLeads,
    campaignTitle,
    setCampaignTitle,
    mapRef,
    leadData,
    activeLead,
    setActiveLead,
    campaignHasAllLeads,
    onAllLeadsButton,
    onLeadButton,
    onStart,
  } = useLeadSearchPage();

  return (
    <div className="flex flex-1 items-center">
      <div
        className={clsx(
          "p-[60px] pr-[30px] h-full",
          "transition-[flex] duration-150",
          showLeads ? "flex-[.6]" : "flex-1"
        )}
      >
        <div className={clsx("card-base h-full box-shadow p-[30px]")}>
          <div className="relative card-base box-shadow w-full h-full overflow-hidden">
            <div className="absolute z-1 top-[30px] left-[30px] pointer-events-auto">
              <IconButton
                onClick={() => openSideNav(SideNavControlVariant.LeadFilters)}
                name={Icons.Menu}
                variant={IconButtonVariant.White}
              />
            </div>
            {showLeads && (
              <div className="absolute z-1 bottom-[30px] left-[30px]  w-[25%] pointer-events-auto">
                <CampaignCard
                  campaignLeads={campaignLeads.length}
                  title={campaignTitle}
                  setTitle={setCampaignTitle}
                  onStart={() => onStart(false)}
                />
              </div>
            )}
            <Map
              ref={mapRef}
              pins={leadData.map((lead, i) => ({
                center: {
                  lat: lead.latitude,
                  lng: lead.longitude,
                },
                iconName: Icons.UserPin,
                active: i === activeLead,
                onClick: () => setActiveLead(i),
              }))}
            />
          </div>
        </div>
      </div>

      <LeadListSection
        animated
        animationTrigger={showLeads}
        leads={leadData}
        title={`${leadData.length} results`}
        getLeadProps={(lead, i) => ({
          active: i === activeLead,
          button: {
            text: campaignLeads.includes(i)
              ? "Remove from campaign"
              : "Add to campaign",
            icon: campaignLeads.includes(i) ? Icons.Minus : Icons.Flag,
            onClick: () => onLeadButton(i),
          },
          onTitleClick: () => (
            mapRef.current?.centerMap({
              lat: lead.latitude,
              lng: lead.longitude,
            }),
            setActiveLead(i)
          ),
        })}
        footerBtn={{
          text: campaignHasAllLeads
            ? "Remove all from campaign"
            : "Add all to campaign",
          icon: campaignHasAllLeads ? Icons.Minus : Icons.Flag,
          onClick: onAllLeadsButton,
        }}
      />

      {/* <div
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
            {showLeads && (
              <span className="block sticky top-0 z-1 bg-background w-full text-center text-base pb-[5px]">
                {leadData.length} results
              </span>
            )}
            <div className="w-full flex flex-col space-y-[30px] py-[30px] pl-[30px] pr-[60px]  ">
              {leadData.map((lead, i) => (
                <LeadCard
                  key={i}
                  i={i}
                  lead={lead}
                  active={i === activeLead}
                  onTitleClick={() => (
                    mapRef.current?.centerMap({
                      lat: lead.latitude,
                      lng: lead.longitude,
                    }),
                    setActiveLead(i)
                  )}
                  button={{
                    text: campaignLeads.includes(i)
                      ? "Remove from campaign"
                      : "Add to campaign",
                    icon: campaignLeads.includes(i) ? Icons.Minus : Icons.Flag,
                    onClick: () => onLeadButton(i),
                  }}
                />
              ))}
            </div>
            <div className="sticky bottom-0 left-0 z-1 bg-background w-full flex justify-center p-[15px] pb-0">
              <Button
                text={
                  campaignHasAllLeads
                    ? "Remove all from campaign"
                    : "Add all to campaign"
                }
                icon={campaignHasAllLeads ? Icons.Minus : Icons.Flag}
                onClick={onAllLeadsButton}
              />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};
