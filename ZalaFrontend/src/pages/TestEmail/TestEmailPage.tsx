import { useState } from "react";
import { TextInput, Button, IconButtonVariant, Icons } from "../../components";
import { useApi } from "../../hooks";
import { useAuthStore } from "../../stores";
import { useSnack } from "../../hooks/utils";

export const TestEmailPage = () => {
  const user = useAuthStore((state) => state.user);
  const gmailConnected = user?.gmailConnected ?? false;

  const { sendTestEmail } = useApi();
  const [successMsg, errorMsg] = useSnack();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Welcome to Zala!");
  const [html, setHtml] = useState(
    "<p>Hi there,<br/>This is a test email from Zala.</p>"
  );
  const [fromName, setFromName] = useState("");
  const [sending, setSending] = useState(false);

  const onSendClick = async () => {
    if (!user) {
      errorMsg("You must be logged in.");
      return;
    }
    if (!gmailConnected) {
      errorMsg("Connect your Google account first.");
      return;
    }
    if (!to || !subject || !html) {
      errorMsg("Recipient, subject, and body are required.");
      return;
    }

    setSending(true);
    const response = await sendTestEmail({
      userId: user.userId,
      to,
      subject,
      html,
      fromName: fromName || undefined,
    });
    setSending(false);

    if (response.err || !response.data) {
      errorMsg(response.err ?? "Failed to send email.");
      return;
    }

    successMsg(`Email sent! Gmail id ${response.data.id}`);
  };

  return (
    <div className="flex flex-1 justify-center p-[40px] overflow-y-auto">
      <div className="card-base box-shadow w-full max-w-3xl space-y-6 p-8">
        <div className="space-y-1">
          <p className="text-3xl font-bold text-secondary">
            Gmail Send Test
          </p>
          <p className="text-secondary-50">
            Use this page to verify Gmail OAuth + send flow end-to-end.
          </p>
        </div>

        <div
          className="rounded-md border p-4"
          style={{
            borderColor: gmailConnected
              ? "var(--color-accent)"
              : "var(--color-error)",
            color: gmailConnected
              ? "var(--color-accent)"
              : "var(--color-error)",
          }}
        >
          {gmailConnected
            ? "Google account is connected. You can send test messages."
            : "Google account is not connected. Sign in with Google from the login/signup page to enable Gmail sending."}
        </div>

        <div className="space-y-4">
          <TextInput
            label="Recipient Email"
            value={to}
            setValue={setTo}
            flatIcon
            iconVariant={IconButtonVariant.Clear}
            icon={Icons.Mail}
          />
          <TextInput
            label="Subject"
            value={subject}
            setValue={setSubject}
            flatIcon
            iconVariant={IconButtonVariant.Clear}
            icon={Icons.Txt}
          />
          <TextInput
            label="From Name (optional)"
            value={fromName}
            setValue={setFromName}
            flatIcon
            iconVariant={IconButtonVariant.Clear}
            icon={Icons.User}
          />
          <div className="space-y-2">
            <label className="text-secondary text-sm font-semibold">
              HTML Body
            </label>
            <textarea
              className="w-full min-h-[200px] rounded-md border-2 border-secondary p-3 text-secondary focus:outline-none focus:border-accent"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
          </div>
        </div>

        <Button
          text={sending ? "Sending..." : "Send Test Email"}
          onClick={onSendClick}
          disabled={!gmailConnected || sending}
        />
      </div>
    </div>
  );
};
