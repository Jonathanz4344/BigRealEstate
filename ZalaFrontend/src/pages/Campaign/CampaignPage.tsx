import { EmailModal, Icons, LeadListSection } from "../../components";
import { produce } from "immer";
import { ButtonVariant } from "../../components/buttons/ButtonVariant";
import { CampaignFolders } from "./components";
import { LoadingPage } from "../Loading";
import { useCampaignPage } from "../../hooks";
import { CampaignContactMethod } from "../../interfaces";

export const CampaignPage = () => {
  const {
    pageLoading,

    showEmail,
    setShowEmail,
    title,
    setTitle,
    multiEmail,
    setMultiEmail,
    selectedLeads,
    setSelectedLeads,
    setShowGoogleRequired,

    user,
    leads,

    viewingLeadId,
    viewingCampaignLead,
    setViewingLead,

    showSelectAllButton,
    selectAll,
    unselectAll,

    onSendEmail,
    updateLeadContactMethod,
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
              onPrimary={(from) =>
                user?.gmailConnected
                  ? (setShowEmail(true), setMultiEmail(from === "multi"))
                  : setShowGoogleRequired(true)
              }
              unselectAll={unselectAll}
              onContactMethod={(method) => {
                if (
                  !viewingCampaignLead ||
                  viewingCampaignLead.contactMethods.includes(method)
                )
                  return;

                if (method === CampaignContactMethod.Email) setShowEmail(true);
                else updateLeadContactMethod(method, viewingLeadId);
              }}
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

      <EmailModal
        leads={leads.filter((lead) =>
          multiEmail
            ? selectedLeads.includes(lead.leadId)
            : lead.leadId === viewingLeadId
        )}
        open={showEmail}
        onClose={() => setShowEmail(false)}
        onSendEmail={onSendEmail}
      />
    </div>
  );
};
