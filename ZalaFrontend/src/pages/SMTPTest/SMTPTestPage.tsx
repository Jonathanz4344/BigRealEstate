import { useState, useEffect } from "react";
import { TextInput, Button, Icons } from "../../components";
import { useApi } from "../../hooks";
import { useSnack } from "../../hooks/utils";
import transition from "../../utils/transitions/transition";
type SMTPConfig = {
  configured: boolean;
  host: string | null;
  port: number;
};

export const SMTPTestPage = transition(() => {
  const { smtpGetConfig, smtpSendEmail } = useApi();
  const [successMsg, errorMsg] = useSnack();

  const [config, setConfig] = useState<SMTPConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [toEmail, setToEmail] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("You're Invited to Join ZLA!");
  const [body, setBody] = useState(
    "You've been invited to join a team on ZLA. Click the link below to get started.",
  );
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const response = await smtpGetConfig();
    if (response.data) {
      setConfig(response.data);
    }
    setLoading(false);
  };

  const onSendClick = async () => {
    if (!toEmail) {
      errorMsg("Email is required.");
      return;
    }
    if (!name) {
      errorMsg("Name is required.");
      return;
    }
    if (!subject) {
      errorMsg("Subject is required.");
      return;
    }

    setSending(true);
    const response = await smtpSendEmail({
      to_email: toEmail,
      name,
      subject,
      body,
    });
    setSending(false);

    if (response.err || !response.data) {
      errorMsg(response.err ?? "Failed to send email.");
      return;
    }

    successMsg(response.data.message);
  };

  if (loading) {
    return (
      <div className="flex flex-1 justify-center items-center p-10">
        <p className="text-secondary-50">Loading SMTP configuration...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center p-10 overflow-y-auto">
      <div className="card-base box-shadow w-full max-w-xl space-y-6 p-8">
        <div className="space-y-1">
          <p className="text-3xl font-bold text-secondary">SMTP Email Test</p>
          <p className="text-secondary-50">
            Send a test email to verify SMTP is working.
          </p>
        </div>

        {/* SMTP Status */}
        <div
          className={`rounded-xl border p-4 ${
            config?.configured
              ? "border-[#d2e3fc] bg-offwhite"
              : "border-[#fad2cf] bg-[#fef7f5]"
          }`}
        >
          {config?.configured ? (
            <p className="text-sm text-[#1a73e8]">
              ✓ SMTP configured: {config.host}:{config.port}
            </p>
          ) : (
            <p className="text-sm text-[#d93025]">
              ✗ SMTP not configured. Add SMTP settings to backend .env file.
            </p>
          )}
        </div>

        {/* Email Form */}
        <div className="space-y-4">
          <TextInput
            label="To Email"
            placeholder="recipient@example.com"
            value={toEmail}
            setValue={setToEmail}
          />
          <TextInput
            label="Name"
            placeholder="John"
            value={name}
            setValue={setName}
          />
          <TextInput
            label="Subject"
            placeholder="Email subject"
            value={subject}
            setValue={setSubject}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-secondary">Body</label>
            <textarea
              className="w-full h-32 p-3 border border-secondary-25 rounded-xl resize-none focus:outline-none focus:border-accent"
              placeholder="Email body (will be prefixed with 'Hi [Name],')"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-secondary-50">
              Email will start with "Hi {name || "[Name]"},"
            </p>
          </div>
        </div>

        {/* Send Button */}
        <Button
          text={sending ? "Sending..." : "Send Test Email"}
          onClick={onSendClick}
          disabled={sending || !config?.configured}
          icon={sending ? undefined : Icons.Email}
        />
      </div>
    </div>
  );
});
