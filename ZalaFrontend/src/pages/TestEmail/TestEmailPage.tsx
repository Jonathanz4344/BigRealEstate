import { useState } from "react";
import {
  TextInput,
  Button,
  IconButtonVariant,
  Icons,
  RichTextEditor,
  GoogleAuthButton,
} from "../../components";
import { useApi } from "../../hooks";
import { useAuthStore } from "../../stores";
import { useGoogleAuthButtonCallback, useSnack } from "../../hooks/utils";

export const TestEmailPage = () => {
  const user = useAuthStore((state) => state.user);
  const gmailConnected = user?.gmailConnected ?? false;

  const { sendTestEmail } = useApi();
  const [successMsg, errorMsg] = useSnack();
  const googleConnectCallback = useGoogleAuthButtonCallback({
    onMsg: () => "Google account connected. You can send test emails now.",
  });

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
          className={`space-y-3 rounded-2xl border p-5 ${
            gmailConnected
              ? "border-[#d2e3fc] bg-[#f8fafd]"
              : "border-[#fad2cf] bg-[#fef7f5]"
          }`}
        >
          {gmailConnected ? (
            <>
              <p className="text-sm font-semibold uppercase text-[#1a73e8]">
                Gmail connected
              </p>
              <p className="text-lg font-semibold text-secondary">
                You can send test messages.
              </p>
              <p className="text-sm text-secondary-50">
                Use the form below to deliver a real Gmail message through your
                connected Google Workspace account.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase text-[#d93025]">
                Google account required
              </p>
              <p className="text-lg font-semibold text-secondary">
                Connect Google to enable Gmail sending.
              </p>
              <p className="text-sm text-secondary-50">
                Sign in with your Google account so Zala can securely send email
                on your behalf via Gmail.
              </p>
              <div className="max-w-xs">
                <GoogleAuthButton
                  callback={googleConnectCallback}
                  className="w-full"
                  getExtraPayload={
                    user
                      ? () => ({
                          targetUserId: user.userId,
                        })
                      : undefined
                  }
                />
              </div>
            </>
          )}
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
          <RichTextEditor
            label="Email Body"
            value={html}
            onChange={setHtml}
            placeholder="Write your message and format it with the toolbar..."
          />
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
