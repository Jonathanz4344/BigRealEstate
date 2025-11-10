import {
  IconButton,
  IconButtonVariant,
  Icons,
  LeadListSection,
  Loader,
  Map,
} from "../../components";
import { useLeadSearchPage } from "../../hooks";
import { SideNavControlVariant, useSearchQueryStore } from "../../stores";
import clsx from "clsx";
import { CampaignCard } from "./components";
import { COLORS } from "../../config";
import type { ILead, ISourceResult } from "../../interfaces";

const SOURCE_COLOR_MAP: Record<string, string> = {
  rapidapi: "#60A5FA", // blue
  google_places: "#34D399", // emerald
  gpt: "#F472B6", // pink
  db: "#FBBF24", // amber
  mock: "#A8A29E", // cool gray
};

const getSourceColor = (lead: ISourceResult<ILead>): string => {
  if (lead.source && SOURCE_COLOR_MAP[lead.source]) {
    return SOURCE_COLOR_MAP[lead.source];
  }
  return COLORS.white;
};

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
  const loading = useSearchQueryStore((state) => state.loading);

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
                  lat: lead.address.lat,
                  lng: lead.address.long,
                },
                iconName: Icons.UserPin,
                active: i === activeLead,
                color: getSourceColor(lead),
                activeColor: COLORS.accent,
                onClick: () => setActiveLead(i),
              }))}
            />
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader />
              </div>
            )}
          </div>
        </div>
      </div>

      <LeadListSection
        animated
        animationTrigger={showLeads}
        leads={leadData}
        title={loading ? "Loading leads..." : `${leadData.length} results`}
        loading={loading}
        getLeadProps={(lead, i) => ({
          active: i === activeLead,
          button: {
            text: campaignLeads.includes(i) ? "Remove Lead" : "Add Lead",
            icon: campaignLeads.includes(i) ? Icons.Minus : Icons.Flag,
            onClick: () => onLeadButton(i),
          },
          onTitleClick: () => (
            mapRef.current?.centerMap({
              lat: lead.address.lat,
              lng: lead.address.long,
            }),
            setActiveLead(i)
          ),
        })}
        footerBtn={{
          text: campaignHasAllLeads ? "Remove all leads" : "Add all leads",
          icon: campaignHasAllLeads ? Icons.Minus : Icons.Flag,
          onClick: onAllLeadsButton,
        }}
      />
    </div>
  );
};
