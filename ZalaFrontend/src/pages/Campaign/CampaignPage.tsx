import { EmailModal, Icons, LeadListSection } from "../../components";
import { produce } from "immer";
import { ButtonVariant } from "../../components/buttons/ButtonVariant";
import { CampaignFolders } from "./components";
import { LoadingPage } from "../Loading";
import { useCampaignPage } from "../../hooks";

export const CampaignPage = () => {
  const {
    pageLoading,
    title,
    setTitle,
    leads,
    setShowEmail,
    unselectAll,
    updateLeadContactMethod,
    showSelectAllButton,
    selectAll,
    selectedLeads,
    setViewingLead,
    setSelectedLeads,
    showEmail,
  } = useCampaignPage();

  return pageLoading ? (
    <LoadingPage />
  ) : (
    <div className="flex flex-1 flex-row">
      <div className="flex-[.6] h-full max-h-full px-[60px] py-[30px] flex flex-col">
        <div className="grow-1 w-full max-w-full flex flex-col space-y-[30px]">
          <div className="w-ful">
            <input
              className="border-text-input w-[50%] !text-2xl py-[5px] line-clamp-1"
              placeholder="Campaign Title"
              value={title}
              onChange={({ currentTarget: { value } }) => setTitle(value)}
            />
          </div>
          <div className="grow-1 w-full">
            <CampaignFolders
              allLeads={leads}
              onPrimary={() => setShowEmail(true)}
              unselectAll={unselectAll}
              onContactMethod={updateLeadContactMethod}
            />
          </div>
        </div>
      </div>
      <LeadListSection
        leads={leads}
        footerBtn={{
          text: showSelectAllButton ? "Select all" : "Unselect all",
          icon: showSelectAllButton
            ? Icons.CheckboxOutline
            : Icons.CheckboxChecked,
          onClick: showSelectAllButton ? selectAll : unselectAll,
          variant: showSelectAllButton
            ? ButtonVariant.Primary
            : ButtonVariant.Tertiary,
        }}
        getLeadProps={(lead) => ({
          active: selectedLeads.includes(lead.leadId),
          onTitleClick: () => setViewingLead(lead.leadId),
          button: {
            text: "Select lead",
            icon: selectedLeads.includes(lead.leadId)
              ? Icons.CheckboxChecked
              : Icons.CheckboxOutline,
            onClick: () =>
              setSelectedLeads(
                produce(selectedLeads, (draft) => {
                  if (draft.includes(lead.leadId))
                    return draft.filter((v) => v !== lead.leadId);
                  else draft.push(lead.leadId);
                })
              ),
          },
        })}
      />

      <EmailModal open={showEmail} onClose={() => setShowEmail(false)} />
    </div>
  );
};
