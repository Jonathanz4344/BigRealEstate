import { useState } from "react";
import type { ILead, IUser } from "../../../interfaces";
import { useAuthStore, useCampaignStore } from "../../../stores";
import { contactFullName, Normalizer } from "../../../utils";
import { useApi } from "../../api";

type IEmailTemplate = {
  subject: string;
  body: string;
};

type UseEmailModalProps = {
  leads: ILead[];
  onSendEmail?: (leads: ILead[]) => void;
};

const EMAIL_TEMPLATES: ((user?: IUser) => IEmailTemplate)[] = [
  (user?: IUser) => ({
    subject: "Opportunity for Mutual Lead Sharing & Cross-Market Referrals",
    body: `<p data-start="420" data-end="428">Hello,<br><br></p>
<p data-start="430" data-end="779">I hope you're doing well. My name is <b>${contactFullName(
      user?.contact
    )}</b>, and I'm reaching out to explore the possibility of collaborating on lead sharing and cross-market referrals. I currently work with buyers and sellers who are considering opportunities in a variety of markets, and I often encounter clients looking for trusted local agents outside of my primary area.<br><br></p>
<p data-start="781" data-end="1185">I'm looking to build strong connections with reliable agents in different regions so we can exchange potential leads when our clients express interest in relocating, investing, or exploring properties in markets outside our own. In return, I'm happy to share qualified leads or referrals for opportunities that arise in my area, and I would welcome the chance to send interested clients your way as well.<br><br></p>
<p data-start="1187" data-end="1385">There's no commitment or formal arrangement needed — simply an open line of communication so we can help each other serve clients more effectively and create additional opportunities for both sides.<br><br></p>
<p data-start="1387" data-end="1513">If this sounds like something you'd be open to, I'd be glad to connect further and learn a bit more about your market focus.<br><br></p>
<p data-start="1515" data-end="1598">Thank you for your time, and I look forward to the possibility of working together.<br><br></p>
<p data-start="1600" data-end="1656">Best regards,<br data-start="1613" data-end="1616"><span style="font-weight: bolder;">${contactFullName(
      user?.contact
    )}</span><br data-start="1627" data-end="1630"><span style="font-weight: 700;">${
      user?.contact?.email ?? ""
    }</span>${
      user?.contact?.email && user.contact.phone
        ? ` - <span style="font-weight: bolder;">${user?.contact?.phone}</span></p>`
        : ""
    }`,
  }),
];

export const useEmailModal = ({ leads, onSendEmail }: UseEmailModalProps) => {
  const user = useAuthStore((state) => state.user);
  const { campaign: globalCampaign, setCampaign } = useCampaignStore();
  const { sendCampaignEmail, apiResponseError } = useApi();

  const emailTemplate = EMAIL_TEMPLATES[0](user);

  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState(contactFullName(user?.contact));
  const [subject, setSubject] = useState(emailTemplate.subject);
  const [body, setBody] = useState(emailTemplate.body);

  const onSubmit = async () => {
    if (globalCampaign.campaignId === -1) return;

    setLoading(true);
    const res = await sendCampaignEmail({
      campaignId: globalCampaign.campaignId,
      leadIds: leads.map((lead) => lead.leadId),
      fromName: from,
      body,
      subject,
    });
    setLoading(false);

    if (res.err || !res.data)
      return apiResponseError("sending campaign email", res.err);

    const campaign = Normalizer.APINormalizer.campaign(res.data.campaign);
    setCampaign(campaign);

    const emailResults = res.data.results.map(
      Normalizer.APINormalizer.campaignEmailSendResult
    );
    const failedResults = emailResults.filter(
      (email) => email.status === "failed"
    );

    const failedResponse = () =>
      apiResponseError(
        "sending campaign email",
        failedResults.map((email) => email.errorDetail).join(", "),
        {
          msg: `Some emails failed to be delivered... please try again later`,
          showSnack: true,
        }
      );

    if (failedResults.length === emailResults.length) return failedResponse();

    if (failedResults.length > 0) failedResponse();

    if (onSendEmail) onSendEmail(leads);
  };

  return {
    subject,
    setSubject,
    from,
    setFrom,
    body,
    setBody,
    loading,
    onSubmit,
  };
};
