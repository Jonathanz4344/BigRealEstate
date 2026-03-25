import { Button, EmailModal, Icons, LeadInfoSection, LeadListSection, LeadNotesSection } from "../../components";
import { produce } from "immer";
import { ButtonVariant } from "../../components/buttons/ButtonVariant";
import { CampaignFolders, ContactMethod } from "./components";
import { LoadingPage } from "../Loading";
import { useCampaignHighlightComponents, useCampaignPage, useShouldShowTutorial } from "../../hooks";
import { CampaignContactMethod, CampaignTab } from "../../interfaces";
import transition from "../../utils/transitions/transition";
import { TutorialPage, useCampaignPageStore, useTutorialStore } from "../../stores";

/**
 * Container of all leads in a campaign.
 *
 * @returns {CampaignPage}
 */
export const CampaignPage = transition(() => {
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
  console.log(leads)
  const {tab} = useCampaignPageStore();
  const { notes, setNotes } = useCampaignPageStore();
  const {tutorial} = useTutorialStore()
  const {highlightComponentDims, highlightComponentDimsChange, refs} = useCampaignHighlightComponents()
  useShouldShowTutorial({
    page: TutorialPage.Campaign,
    highlightComponentDims,
    highlightComponentDimsChange,
    forceWait: (tutorial?.campaign_step === 2 && tab !== CampaignTab.Connect) || (tutorial?.campaign_step === 3 && tab !== CampaignTab.Notes) || (tutorial?.campaign_step === 4 && tab !== CampaignTab.Profile),
    components: [null,
      () => (
        <div className="w-[300px]">
          <Button
            variant={ButtonVariant.Primary}
            text="Email All"
            icon={Icons.Mail}
          />
        </div>
      ),
      () => (
        <div className="flex flex-row justify-between w-full pt-[5px] px-[15px] bg-primary">
          <ContactMethod
            active={false}
            onClick={() => {return;}}
            text="Email"
            icon={Icons.Mail}
            disabled={true}
          />
          <ContactMethod
            active={false}
            onClick={() => {return;}}
            text="Phone"
            icon={Icons.Phone}
            disabled={true}
          />
          <ContactMethod
            active={false}
            onClick={() => {return;}}
            text="SMS"
            icon={Icons.Txt}
            disabled={true}
          />
        </div>
      ),
      () => (
        <div className="w-full h-full flex flex-col items-center relative">
          <div className="absolute-fill bg-primary">
            <p className="w-full text-center text-xl font-bold">
              Notes: {leads[0].contact?.firstName} {leads[0].contact?.lastName}
            </p>
            <div className="w-full h-full flex grow-1 pb-[15px]">
              <LeadNotesSection
                lead={leads[0]}
                notes={notes}
                setNotes={setNotes}
              />
            </div>
          </div>
        </div>
      ),
      () => (
        <div className="absolute-fill flex flex-col items-center overflow-scroll bg-primary">
          <p className="w-full text-center text-xl font-bold">
            Contact: {leads[0].contact?.firstName} {leads[0].contact?.lastName}
          </p>
          <div className="w-full flex grow-1 items-center justify-center">
            <LeadInfoSection lead={leads[0]} />
          </div>
        </div>
      )
    ]
  })

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
              notesRef={refs.notesRef}
              contactRef={refs.contactRef}
              emailButtonRef={refs.emailAllRef}
              infoRef={refs.infoRef}
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
                }),
              ),
          },
        })}
      />

      <EmailModal
        leads={leads.filter((lead) =>
          multiEmail
            ? selectedLeads.includes(lead.leadId)
            : lead.leadId === viewingLeadId,
        )}
        open={showEmail}
        onClose={() => setShowEmail(false)}
        onSendEmail={onSendEmail}
      />
    </div>
  );
});
