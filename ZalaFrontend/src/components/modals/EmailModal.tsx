import { Button, ButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { TextInput, RichTextEditor } from "../inputs";
import { Modal, type ModalProps } from "./Modal";
import type { ILead } from "../../interfaces";
import { useEmailModal } from "../../hooks";

type EmailModalProps = ModalProps & {
  leads: ILead[];
  onSendEmail?: (leads: ILead[]) => void;
};

export const EmailModal = ({
  open,
  leads,
  onClose,
  onSendEmail,
}: EmailModalProps) => {
  const {
    subject,
    setSubject,
    from,
    setFrom,
    body,
    setBody,
    signature,
    setSignature,
    loading,
    loadingSignature,
    onSubmit,
  } = useEmailModal({ leads, onSendEmail });
  const hasEmail = [];
  const notHasEmail = [];
  for (const i of leads) {
    if (i.contact?.email) {
      hasEmail.push(i);
    } else {
      notHasEmail.push(i);
    }
  }
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-h-[80vh] p-6 flex flex-col overflow-hidden">
        <div className="space-y-1.25 mb-4 shrink-0">
          <h2 className="text-2xl font-bold text-secondary">
            Email Lead{leads.length > 1 ? "s" : ""}
          </h2>
          <p className="text-secondary-50 text-sm line-clamp-2">
            {hasEmail.length < 1 ? "" : "Send an email to"}{" "}
            {hasEmail.slice(0, Math.min(leads.length, 3)).map((lead) => (
              <span
                key={lead.leadId ?? lead.contact?.email}
                className="font-bold text-secondary"
              >{`${lead.contact?.firstName} ${lead.contact?.lastName} (${
                lead.contact?.email ?? lead.contact?.phone
              })`}</span>
            ))}{" "}
            {hasEmail.length > 3 ? `+${hasEmail.length - 3} more` : ""}
          </p>
          <p className="text-secondary-50 text-sm line-clamp-2">
            {hasEmail.length < 1 ? "Cannot Email" : ""}{" "}
            {notHasEmail.slice(0, Math.min(leads.length, 3)).map((lead) => (
              <span
                key={lead.leadId ?? lead.contact?.email}
                className="font-bold text-secondary"
                style={{ color: "red" }}
              >{`${lead.contact?.firstName} ${lead.contact?.lastName} (${
                lead.contact?.email ?? lead.contact?.phone
              })`}</span>
            ))}{" "}
            {notHasEmail.length > 3 ? `+${notHasEmail.length - 3} more` : ""}
          </p>
        </div>
        <div className="space-y-3.75 flex-1 overflow-y-auto pr-2 min-h-0">
          <TextInput
            label="Subject"
            value={subject}
            setValue={setSubject}
            icon={Icons.Txt}
          />
          <TextInput
            label="From Name"
            value={from}
            setValue={setFrom}
            icon={Icons.User}
          />
          <RichTextEditor label="Body" value={body} onChange={setBody} />
          <div className="space-y-1">
            <label className="text-secondary text-sm font-semibold">
              Signature{" "}
              {loadingSignature && (
                <span className="text-xs text-gray-400">(loading...)</span>
              )}
            </label>
            <div
              className="rounded-[15px] border-2 border-secondary bg-white p-3 text-secondary text-sm focus-within:border-accent [&_img]:max-w-full [&_img]:h-auto [&_img]:inline-block"
              contentEditable
              suppressContentEditableWarning
              onInput={(e) =>
                setSignature((e.target as HTMLDivElement).innerHTML)
              }
              dangerouslySetInnerHTML={{ __html: signature }}
            />
            {signature.includes("<img") && (
              <p className="text-xs text-gray-400">
                Images in your signature may not preview here but will appear in
                the sent email.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-row space-x-3.75 mt-6 pt-2 border-t border-gray-100 shrink-0">
          <Button
            text={"Cancel"}
            onClick={onClose}
            variant={ButtonVariant.Secondary}
            disabled={loading}
          />
          <Button
            text={
              loading
                ? "Sending..."
                : hasEmail.length === 0
                  ? "Send Test Campaign"
                  : "Send Campaign"
            }
            onClick={onSubmit}
            disabled={loading}
            icon={Icons.Mail}
          />
        </div>
      </div>
    </Modal>
  );
};
