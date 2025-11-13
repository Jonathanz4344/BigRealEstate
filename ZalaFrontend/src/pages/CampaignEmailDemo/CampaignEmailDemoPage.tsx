import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  ButtonVariant,
  Icons,
  IconButtonVariant,
  RichTextEditor,
  Select,
  TextInput,
} from "../../components";
import { useApi } from "../../hooks";
import { useSnack } from "../../hooks/utils";
import type {
  ACampaignEmail,
  ACampaignEmailSendResult,
  ACampaignSummary,
} from "../../interfaces";

const DEFAULT_HTML =
  "<p>Hi there,<br/>Here is a quick update from the Zala team.</p>";

type DraftFormState = {
  campaignId: string;
  leadId: string;
  subject: string;
  fromName: string;
  body: string;
};

type SendFormState = {
  campaignId: string;
  leadIds: string;
  subject: string;
  fromName: string;
  body: string;
};

const buildDraftState = (campaignId: string): DraftFormState => ({
  campaignId,
  leadId: "",
  subject: "New listings you should see",
  fromName: "",
  body: DEFAULT_HTML,
});

const buildSendState = (campaignId: string): SendFormState => ({
  campaignId,
  leadIds: "",
  subject: "New listings you should see",
  fromName: "",
  body: DEFAULT_HTML,
});

export const CampaignEmailDemoPage = () => {
  const {
    listCampaigns,
    createCampaignEmailDraft,
    listCampaignEmails,
    sendCampaignEmail,
    updateCampaignEmailDraft,
    deleteCampaignEmailDraft,
  } = useApi();
  const [successMsg, errorMsg] = useSnack();
  const errorMsgRef = useRef(errorMsg);
  const listCampaignEmailsRef = useRef(listCampaignEmails);
  const listCampaignsRef = useRef(listCampaigns);
  const draftSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    errorMsgRef.current = errorMsg;
  }, [errorMsg]);

  useEffect(() => {
    listCampaignEmailsRef.current = listCampaignEmails;
  }, [listCampaignEmails]);

  useEffect(() => {
    listCampaignsRef.current = listCampaigns;
  }, [listCampaigns]);

  const [campaigns, setCampaigns] = useState<ACampaignSummary[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [draftForm, setDraftForm] = useState<DraftFormState>(
    buildDraftState("")
  );
  const [sendForm, setSendForm] = useState<SendFormState>(buildSendState(""));
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const [drafts, setDrafts] = useState<ACampaignEmail[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);

  const [sendResults, setSendResults] = useState<ACampaignEmailSendResult[]>(
    []
  );
  const [resultCampaignName, setResultCampaignName] = useState("");

  const [savingDraft, setSavingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingDraftId, setDeletingDraftId] = useState<number | null>(null);

  const selectedCampaign = useMemo(
    () =>
      campaigns.find(
        (campaign) =>
          String(campaign.campaign_id) === String(selectedCampaignId)
      ),
    [campaigns, selectedCampaignId]
  );

  const numberOrNull = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const parseLeadIds = (value: string): number[] =>
    value
      .split(",")
      .map((token) => Number(token.trim()))
      .filter((num) => Number.isFinite(num) && num > 0);

  const setDraftField = (field: keyof DraftFormState, value: string) => {
    setDraftForm((prev) => ({ ...prev, [field]: value }));
  };
  const setSendField = (field: keyof SendFormState, value: string) => {
    setSendForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetDraftForm = useCallback(
    (campaignIdOverride?: string) => {
      const campaignIdValue = campaignIdOverride ?? selectedCampaignId ?? "";
      setDraftForm(buildDraftState(campaignIdValue));
      setEditingMessageId(null);
    },
    [selectedCampaignId]
  );

  const refreshDrafts = useCallback(async (campaignId: number) => {
    setDraftsLoading(true);
    const response = await listCampaignEmailsRef.current({
      campaignId,
      limit: 50,
    });
    setDraftsLoading(false);
    if (response.err || !response.data) {
      errorMsgRef.current(response.err ?? "Unable to load drafts.");
      return;
    }
    setDrafts(response.data);
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    const response = await listCampaignsRef.current({ limit: 50 });
    setLoadingCampaigns(false);
    if (response.err || !response.data) {
      errorMsgRef.current(response.err ?? "Unable to load campaigns.");
      return;
    }
    setCampaigns(response.data);
    if (response.data.length > 0) {
      setSelectedCampaignId((prev) =>
        prev ? prev : String(response.data[0].campaign_id)
      );
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (!selectedCampaignId) return;
    setDraftForm((prev) =>
      prev.campaignId === selectedCampaignId
        ? prev
        : { ...prev, campaignId: selectedCampaignId }
    );
    setSendForm((prev) =>
      prev.campaignId === selectedCampaignId
        ? prev
        : { ...prev, campaignId: selectedCampaignId }
    );
    setEditingMessageId(null);
    const numericId = numberOrNull(selectedCampaignId);
    if (numericId) refreshDrafts(numericId);
  }, [selectedCampaignId, refreshDrafts]);

  const onSaveDraft = async () => {
    const campaignId =
      numberOrNull(draftForm.campaignId) || numberOrNull(selectedCampaignId);
    if (!campaignId) {
      errorMsg("Select a campaign first.");
      return;
    }
    if (!draftForm.subject.trim()) {
      errorMsg("Subject is required.");
      return;
    }
    if (!draftForm.body.trim()) {
      errorMsg("Body is required.");
      return;
    }
    setSavingDraft(true);
    const leadIdInput = draftForm.leadId.trim();
    const resolvedLeadId =
      leadIdInput.length > 0 ? numberOrNull(draftForm.leadId) : undefined;
    if (leadIdInput.length > 0 && resolvedLeadId === null) {
      errorMsg("Lead ID must be a positive number.");
      return;
    }

    const payload = {
      campaignId,
      leadId:
        leadIdInput.length > 0
          ? (resolvedLeadId as number | undefined)
          : undefined,
      subject: draftForm.subject.trim(),
      body: draftForm.body,
      fromName: draftForm.fromName.trim() || undefined,
    };
    let response;
    if (editingMessageId) {
      response = await updateCampaignEmailDraft({
        messageId: editingMessageId,
        subject: payload.subject,
        body: payload.body,
        fromName: payload.fromName,
        leadId:
          leadIdInput.length > 0
            ? (resolvedLeadId as number | null | undefined)
            : null,
      });
    } else {
      response = await createCampaignEmailDraft(payload);
    }
    setSavingDraft(false);
    if (response.err || !response.data) {
      errorMsg(response.err ?? "Unable to save draft.");
      return;
    }
    successMsg(editingMessageId ? "Draft updated" : "Draft saved");
    resetDraftForm();
    refreshDrafts(campaignId);
  };

  const onSendCampaign = async () => {
    const campaignId =
      numberOrNull(sendForm.campaignId) || numberOrNull(selectedCampaignId);
    if (!campaignId) {
      errorMsg("Select a campaign first.");
      return;
    }
    const leadIds = parseLeadIds(sendForm.leadIds);
    if (leadIds.length === 0) {
      errorMsg("Add at least one lead id (comma separated).");
      return;
    }
    if (!sendForm.subject.trim()) {
      errorMsg("Subject is required.");
      return;
    }
    if (!sendForm.body.trim()) {
      errorMsg("Body is required.");
      return;
    }
    setSending(true);
    const response = await sendCampaignEmail({
      campaignId,
      leadIds,
      subject: sendForm.subject.trim(),
      body: sendForm.body,
      fromName: sendForm.fromName.trim() || undefined,
    });
    setSending(false);
    if (response.err || !response.data) {
      errorMsg(response.err ?? "Unable to send campaign.");
      return;
    }
    setSendResults(response.data.results);
    const name =
      (response.data.campaign.campaign_name as string | undefined) ?? "";
    setResultCampaignName(
      name
        ? `${response.data.campaign.campaign_id} – ${name}`
        : `${response.data.campaign.campaign_id}`
    );
    successMsg("Campaign send completed");
    refreshDrafts(campaignId);
  };

  const onEditDraft = (draft: ACampaignEmail) => {
    setEditingMessageId(draft.message_id);
    setSelectedCampaignId(String(draft.campaign_id));
    setDraftForm({
      campaignId: String(draft.campaign_id),
      leadId: draft.lead_id ? String(draft.lead_id) : "",
      subject: draft.message_subject,
      fromName: draft.from_name ?? "",
      body: draft.message_body,
    });
    draftSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onDeleteDraft = async (messageId: number) => {
    setDeletingDraftId(messageId);
    const response = await deleteCampaignEmailDraft({ messageId });
    setDeletingDraftId(null);
    if (response.err) {
      errorMsg(response.err ?? "Unable to delete draft.");
      return;
    }
    successMsg("Draft deleted");
    const numericId = numberOrNull(selectedCampaignId);
    if (numericId) refreshDrafts(numericId);
    if (editingMessageId === messageId) resetDraftForm();
  };

  const renderDraftCard = (draft: ACampaignEmail) => {
    const leadName = draft.lead?.contact
      ? [draft.lead.contact.first_name, draft.lead.contact.last_name]
          .filter(Boolean)
          .join(" ")
      : undefined;
    const isDraftEditing = editingMessageId === draft.message_id;

    return (
      <div
        key={draft.message_id}
        className="rounded-lg border border-secondary-25 p-4 space-y-2"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-secondary font-semibold">
              {draft.message_subject}
            </p>
            <p className="text-sm text-secondary-50">
              Message #{draft.message_id} • Lead ID:{" "}
              {draft.lead_id ?? "not set"}{" "}
              {leadName && <span className="text-secondary">({leadName})</span>}
            </p>
          </div>
          {isDraftEditing && (
            <span className="text-xs font-semibold text-accent px-3 py-1 rounded-full bg-accent-10">
              Editing
            </span>
          )}
        </div>
        <p className="text-sm text-secondary-50">
          Status: {draft.send_status.toUpperCase()} • To:{" "}
          {draft.to_email ?? "n/a"}
        </p>
        {draft.error_detail && (
          <p className="text-sm text-error">Error: {draft.error_detail}</p>
        )}
        <div
          className="rounded bg-secondary-5 p-2 text-sm"
          dangerouslySetInnerHTML={{ __html: draft.message_body }}
        />
        <div className="flex gap-3 pt-2 text-sm">
          <button
            className="text-accent font-semibold"
            onClick={() => onEditDraft(draft)}
          >
            Edit
          </button>
          <button
            className="text-error font-semibold disabled:opacity-50"
            onClick={() => onDeleteDraft(draft.message_id)}
            disabled={deletingDraftId === draft.message_id}
          >
            {deletingDraftId === draft.message_id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    );
  };

  const renderResultRow = (result: ACampaignEmailSendResult) => (
    <div
      key={`${result.lead_id}-${result.message_id ?? "pending"}`}
      className="grid grid-cols-4 gap-3 text-sm py-2 border-b border-secondary-10"
    >
      <span className="font-semibold">{result.lead_id}</span>
      <span>{result.to_email ?? "n/a"}</span>
      <span
        className={
          result.status === "sent" ? "text-accent" : "text-secondary-50"
        }
      >
        {result.status.toUpperCase()}
      </span>
      <span className="text-error">{result.error_detail ?? ""}</span>
    </div>
  );

  const campaignOptions = campaigns.map((campaign) => ({
    value: String(campaign.campaign_id),
    text: `${campaign.campaign_id} – ${campaign.campaign_name}`,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
      <div className="card-base box-shadow p-6 space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-secondary">
            Campaign Email Demo
          </h1>
          <p className="text-secondary-50 text-sm">
            Pick a campaign to manage drafts and send Gmail messages without
            memorizing IDs.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Select
            label="Choose Campaign"
            placeHolder={
              loadingCampaigns ? "Loading campaigns..." : "Select campaign"
            }
            value={selectedCampaignId}
            setValue={(v) => setSelectedCampaignId(v)}
            options={campaignOptions}
          />
          <div className="flex gap-3">
            <Button
              text={loadingCampaigns ? "Refreshing..." : "Refresh Campaigns"}
              onClick={fetchCampaigns}
              disabled={loadingCampaigns}
            />
            <Button
              text="Reset Forms"
              variant={ButtonVariant.Secondary}
              onClick={() => {
                resetDraftForm();
                setSendForm(buildSendState(selectedCampaignId));
              }}
            />
          </div>
        </div>
        {selectedCampaign && (
          <p className="text-secondary text-sm">
            Active campaign:{" "}
            <strong>
              {selectedCampaign.campaign_id} – {selectedCampaign.campaign_name}
            </strong>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="card-base box-shadow p-6 space-y-4"
          ref={draftSectionRef}
        >
          <div>
            <h2 className="text-2xl font-bold text-secondary">
              {editingMessageId ? "Edit Draft" : "Create Draft"}
            </h2>
            <p className="text-secondary-50 text-sm">
              Saves to <code>/api/campaign-emails/</code> so you can revisit
              later.
            </p>
          </div>
          <div className="space-y-3">
            <TextInput
              label="Lead ID (optional)"
              value={draftForm.leadId}
              setValue={(v) => setDraftField("leadId", v)}
              icon={Icons.User}
              iconVariant={IconButtonVariant.Clear}
            />
            <TextInput
              label="Subject"
              value={draftForm.subject}
              setValue={(v) => setDraftField("subject", v)}
              icon={Icons.Txt}
            />
            <TextInput
              label="From Name"
              value={draftForm.fromName}
              setValue={(v) => setDraftField("fromName", v)}
              icon={Icons.User}
            />
            <RichTextEditor
              label="Body"
              value={draftForm.body}
              onChange={(v) => setDraftField("body", v)}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              text={
                savingDraft
                  ? "Saving..."
                  : editingMessageId
                  ? "Update Draft"
                  : "Save Draft"
              }
              onClick={onSaveDraft}
              disabled={savingDraft}
            />
            {editingMessageId && (
              <Button
                text="Cancel Edit"
                variant={ButtonVariant.Secondary}
                onClick={() => resetDraftForm()}
              />
            )}
          </div>
        </div>

        <div className="card-base box-shadow p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">
              Send Campaign Email
            </h2>
            <p className="text-secondary-50 text-sm">
              Calls <code>/api/campaign-emails/send</code> using Gmail.
            </p>
          </div>
          <div className="space-y-3">
            <TextInput
              label="Lead IDs (comma separated)"
              value={sendForm.leadIds}
              setValue={(v) => setSendField("leadIds", v)}
              icon={Icons.User}
            />
            <TextInput
              label="Subject"
              value={sendForm.subject}
              setValue={(v) => setSendField("subject", v)}
              icon={Icons.Txt}
            />
            <TextInput
              label="From Name"
              value={sendForm.fromName}
              setValue={(v) => setSendField("fromName", v)}
              icon={Icons.User}
            />
            <RichTextEditor
              label="Body"
              value={sendForm.body}
              onChange={(v) => setSendField("body", v)}
            />
          </div>
          <Button
            text={sending ? "Sending..." : "Send Campaign"}
            onClick={onSendCampaign}
            disabled={sending}
          />
        </div>
      </div>

      <div className="card-base box-shadow p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-secondary">
              Drafts for this campaign
            </h3>
            <p className="text-secondary-50 text-sm">
              Automatically refreshes whenever you pick a campaign or save a
              draft.
            </p>
          </div>
          <Button
            text={draftsLoading ? "Refreshing..." : "Reload Drafts"}
            variant={ButtonVariant.Secondary}
            onClick={() => {
              const numericId = numberOrNull(selectedCampaignId);
              if (numericId) refreshDrafts(numericId);
            }}
            disabled={draftsLoading || !selectedCampaignId}
          />
        </div>
        {drafts.length === 0 ? (
          <p className="text-secondary-50 text-sm">
            {draftsLoading
              ? "Loading drafts..."
              : "No drafts found for this campaign yet."}
          </p>
        ) : (
          <div className="grid gap-4">{drafts.map(renderDraftCard)}</div>
        )}
      </div>

      {sendResults.length > 0 && (
        <div className="card-base box-shadow p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-secondary">
              Send Results
            </h3>
            <p className="text-secondary-50 text-sm">
              Campaign {resultCampaignName}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-xs font-semibold uppercase text-secondary-50 border-b border-secondary-10 pb-2">
            <span>Lead ID</span>
            <span>Recipient</span>
            <span>Status</span>
            <span>Error</span>
          </div>
          {sendResults.map(renderResultRow)}
        </div>
      )}
    </div>
  );
};
