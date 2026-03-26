import {
  CampaignContactMethod,
  type ACampaign,
  type ACampaignLead,
  type AUser,
  type ACampaignEmail,
  type ACampaignEmailSendResponse,
  type ACampaignSummary,
  type ITeamInvitation,
  type ITeam,
  type ITeamMemberWithXP,
  type ITeamAnnouncement,
  type AUserIdXp,
  type ITeamDeal,
  type ITutorial,
  type INotification,
} from "../../interfaces";
import type {
  CreateUserProps,
  LinkContactToUserProps,
  LoginAPIProps,
  LoginGoogleProps,
  SendTestEmailProps,
  CreateCampaignEmailDraftProps,
  SendCampaignEmailProps as SendCampaignEmailPayload,
  CampaignEmailQueryParams,
  UpdateCampaignEmailDraftProps,
  DeleteCampaignEmailDraftProps,
  ListCampaignsParams,
  CreateCampaignProps,
  UpdateCampaignLeadProps,
  SMTPSendRequest,
  SMTPSendResponse,
  SMTPConfigResponse,
  CreateTeamRequest,
  InviteToTeamRequest,
  RespondToInvitationRequest,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  UpdateTeamNameRequest,
  SendVerificationCodeProps,
  SendVerificationCodeResponse,
  VerifyCodeProps,
  VerifyCodeResponse,
  GmailSignatureResponse,
  CloseTeamDealProps,
} from "./types";
import { useFetch } from "./useFetch";
import { useState } from "react";
import { useApiResponseError } from "../utils";
import { useBoardsApi } from "./useBoardsApi";
import { useLeadsApi } from "./useLeadsApi";
import { usePropertyApi } from "./usePropertyApi";

export const useApi = () => {
  const apiResponseError = useApiResponseError();
  const { post, get, put, del, patch } = useFetch();
  const [signal, setSignalState] = useState<AbortSignal>(
    new AbortController().signal,
  );
  const [signalTo, setSignalTo] = useState<string[]>([]);

  const setSignal = (signal: AbortSignal, attatchTo: string[]) => {
    setSignalState(signal);
    setSignalTo(attatchTo);
  };

  const getSignal = (from: string) => {
    if (!signalTo.includes(from)) return new AbortController().signal;
    return signal;
  };

  const idsToQueryString = (
    ids: (string | number)[],
    prefix: string = "id",
  ) => {
    let string = "";
    for (let i = 0; i < ids.length; i++) {
      if (i === 0) string += `${prefix}=${ids[i]}`;
      else string += `&${prefix}=${ids[i]}`;
    }
    return string;
  };

  const apiProps = { signal, getSignal, idsToQueryString };

  const boardsApiRoutes = useBoardsApi(apiProps);
  const leadsContactsAddressApi = useLeadsApi(apiProps);
  const propertyApiRoutes = usePropertyApi(apiProps);

  const createUser = async (body: CreateUserProps) => {
    return await post<AUser>(`/api/users/`, body, {
      isFormData: false,
      signal: getSignal("createUser"),
    });
  };

  const getUserXp = async (userId: number) => {
    return await get<AUserIdXp>(
      `/api/users/${userId}/xp`,
      getSignal("getUserXp"),
    );
  };

  const addUserXP = async (userId: number, xp: number) => {
    return await post<AUserIdXp>(
      `/api/users/${userId}/xp`,
      { amount: xp },
      { isFormData: false, signal: getSignal("addUserXP") },
    );
  };

  const restoreUserXp = async (userId: number) => {
    return await del<AUserIdXp>(
      `/api/users/${userId}/xp`,
      getSignal("restoreUserXp"),
    );
  };

  const createCampaign = async ({
    title,
    leads,
    userId,
  }: CreateCampaignProps) => {
    return await post<ACampaign>(
      `/api/campaigns/`,
      {
        campaign_name: title,
        user_id: userId,
        lead_ids: leads,
      },
      { isFormData: false, signal: getSignal("createCampaign") },
    );
  };

  const linkContactToUser = async (body: LinkContactToUserProps) => {
    return await post<AUser>(
      `/api/users/${body.userId}/contacts/${body.contactId}`,
      {},
      { isFormData: false, signal: getSignal("linkContactToUser") },
    );
  };

  const updateCampaign = async ({
    title,
    leads,
    userId,
    campaignId,
  }: CreateCampaignProps & { campaignId: number }) => {
    return await put<ACampaign>(
      `/api/campaigns/${campaignId}`,
      {
        campaign_name: title,
        user_id: userId,
        lead_ids: leads,
      },
      { isFormData: false, signal: getSignal("updateCampaign") },
    );
  };

  const updateCampaignLead = async ({
    campaignId,
    leadId,
    userId: _userId,
    contactMethods,
  }: UpdateCampaignLeadProps) => {
    return await put<ACampaignLead>(
      `/api/campaign-leads/${campaignId}/leads/${leadId}`,
      {
        phone_contacted: contactMethods.includes(CampaignContactMethod.Phone),
        sms_contacted: contactMethods.includes(CampaignContactMethod.SMS),
        email_contacted: contactMethods.includes(CampaignContactMethod.Email),
      },
    );
  };

  const getUsers = async () => {
    return await get<AUser[]>(`/api/users`, getSignal("getUsers"));
  };

  const getUser = async (userId: string) => {
    return await get<AUser>(`/api/users/${userId}`, getSignal("getUser"));
  };

  const getUserTutorial = async (userId: number) => {
    return await get<ITutorial>(
      `/api/user/${userId}/tutorials`,
      getSignal("getUserTutorial"),
    );
  };

  const updateUserTutorial = async (tutorial: ITutorial) => {
    return await put<ITutorial>(
      `/api/user/${tutorial.user_id}/tutorials`,
      tutorial,
      { isFormData: false, signal: getSignal("updateUserTutorial") },
    );
  };

  const getCampaign = async (
    campaignId: number | string,
    _userId: number | string,
  ) => {
    return await get<ACampaign>(
      `/api/campaigns/${campaignId}`,
      getSignal("getCampaign"),
    );
  };

  const getCampaigns = async (campaignIds: number[] = []) => {
    return await get<ACampaign[]>(
      `/api/campaigns${
        campaignIds.length > 0
          ? `?${idsToQueryString(campaignIds, "campaign_id")}`
          : ""
      }`,
    );
  };

  const loginGoogle = async ({
    code,
    scope,
    targetUserId,
  }: LoginGoogleProps) => {
    const payload: Record<string, unknown> = { code, scope };
    if (typeof targetUserId === "number") {
      payload.target_user_id = targetUserId;
    }
    return await post<AUser>(`/api/login/google`, payload, {
      isFormData: false,
      signal: getSignal("loginGoogle"),
    });
  };

  const loginAPI = async (body: LoginAPIProps) => {
    return await post<AUser>(`/api/login`, body, {
      isFormData: false,
      signal: getSignal("loginAPI"),
    });
  };

  const sendTestEmail = async ({
    userId,
    to,
    subject,
    html,
    fromName,
  }: SendTestEmailProps) => {
    type GmailResponse = { id: string; thread_id?: string };
    return await post<GmailResponse>(
      `/api/google-mail/send`,
      {
        user_id: userId,
        to,
        subject,
        html,
        from_name: fromName,
      },
      { isFormData: false, signal: getSignal("sendTestEmail") },
    );
  };

  const listCampaignEmails = async ({
    campaignId,
    skip,
    limit,
  }: CampaignEmailQueryParams = {}) => {
    const params = new URLSearchParams();
    if (typeof campaignId === "number") {
      params.append("campaign_id", String(campaignId));
    }
    if (typeof skip === "number") {
      params.append("skip", String(skip));
    }
    if (typeof limit === "number") {
      params.append("limit", String(limit));
    }
    const query = params.toString();
    const path = "/api/campaign-emails" + (query.length > 0 ? `?${query}` : "");
    return await get<ACampaignEmail[]>(path, getSignal("listCampaignEmails"));
  };

  const createCampaignEmailDraft = async ({
    campaignId,
    leadId,
    subject,
    body,
    fromName,
  }: CreateCampaignEmailDraftProps) => {
    return await post<ACampaignEmail>(`/api/campaign-emails/`, {
      campaign_id: campaignId,
      lead_id: leadId,
      message_subject: subject,
      message_body: body,
      from_name: fromName,
    });
  };

  const sendCampaignEmail = async ({
    campaignId,
    leadIds,
    subject,
    body,
    fromName,
  }: SendCampaignEmailPayload) => {
    return await post<ACampaignEmailSendResponse>(`/api/campaign-emails/send`, {
      campaign_id: campaignId,
      lead_id: leadIds,
      message_subject: subject,
      message_body: body,
      from_name: fromName,
    });
  };

  const updateCampaignEmailDraft = async ({
    messageId,
    subject,
    body,
    fromName,
    leadId,
  }: UpdateCampaignEmailDraftProps) => {
    const payload: Record<string, unknown> = {};
    if (typeof subject === "string") payload.message_subject = subject;
    if (typeof body === "string") payload.message_body = body;
    if (typeof fromName === "string") payload.from_name = fromName;
    if (typeof leadId === "number") payload.lead_id = leadId;
    else if (leadId === null) payload.lead_id = null;
    return await put<ACampaignEmail>(
      `/api/campaign-emails/${messageId}`,
      payload,
    );
  };

  const deleteCampaignEmailDraft = async ({
    messageId,
  }: DeleteCampaignEmailDraftProps) => {
    return await del<void>(`/api/campaign-emails/${messageId}`);
  };

  const listCampaigns = async ({ skip, limit }: ListCampaignsParams = {}) => {
    const params = new URLSearchParams();
    if (typeof skip === "number") params.append("skip", String(skip));
    if (typeof limit === "number") params.append("limit", String(limit));
    const query = params.toString();
    return await get<ACampaignSummary[]>(
      `/api/campaigns${query ? `?${query}` : ""}`,
    );
  };

  // SMTP Email functions
  const smtpGetConfig = async () => {
    return await get<SMTPConfigResponse>(
      `/api/smtp/config`,
      getSignal("smtpGetConfig"),
    );
  };

  const smtpSendEmail = async (request: SMTPSendRequest) => {
    return await post<SMTPSendResponse>(`/api/smtp/send`, request, {
      isFormData: false,
      signal: getSignal("smtpSendEmail"),
    });
  };

  // Team Management APIs
  const getTeams = async () => {
    return await get<ITeam[]>(`/api/teams/`, getSignal(`getTeams`));
  };

  const createTeam = async ({
    team_name,
    admin_user_id,
  }: CreateTeamRequest) => {
    return await post<ITeam>(
      `/api/teams/with-admin/${admin_user_id}`,
      { team_name },
      { isFormData: false, signal: getSignal("createTeam") },
    );
  };

  const updateTeam = async ({
    team_id,
    team_name,
    xp,
  }: UpdateTeamNameRequest) => {
    return await put<ITeam>(
      `/api/teams/${team_id}`,
      { team_name, xp },
      { isFormData: false, signal: getSignal("updateTeam") },
    );
  };

  const getTeamsByUser = async (userId: number) => {
    return await get<ITeam[]>(
      `/api/teams/user/${userId}`,
      getSignal("getTeamsByUser"),
    );
  };

  const getTeamMembers = async (teamId: number) => {
    return await get<ITeam>(
      `/api/teams/${teamId}/members`,
      getSignal("getTeamMembers"),
    );
  };

  const getTeamMembersByXp = async (teamId: number) => {
    return await get<ITeamMemberWithXP[]>(`/api/teams/${teamId}/users/xp`);
  };

  const closeTeamDeal = async ({
    teamId,
    propertyId,
    user_id,
    notes,
    sale_price,
    closed_at,
    lead_id = 0,
  }: CloseTeamDealProps) => {
    return await post<ITeamDeal>(
      `/api/team/${teamId}/property/${propertyId}/close`,
      {
        user_id,
        notes,
        sale_price,
        closed_at,
        lead_id,
        xp_earned: 1000,
      },
    );
  };

  const inviteToTeam = async ({
    team_id,
    sender_id,
    recipient_email,
  }: InviteToTeamRequest) => {
    return await post<ITeamInvitation>(
      `/api/teams/${team_id}/invitations?sender_id=${sender_id}`,
      { recipient_email },
      { isFormData: false, signal: getSignal("inviteToTeam") },
    );
  };

  const getTeamInvitations = async (teamId: number, requesterId: number) => {
    return await get<ITeamInvitation[]>(
      `/api/teams/${teamId}/invitations?requester_id=${requesterId}`,
      getSignal("getTeamInvitations"),
    );
  };

  const respondToInvitation = async ({
    invitation_id,
    accept,
    user_id,
  }: RespondToInvitationRequest) => {
    return await patch<{ message: string }>(
      `/api/teams/invitations/${invitation_id}/respond?user_id=${user_id}`,
      { status: accept },
      { isFormData: false, signal: getSignal("respondToInvitation") },
    );
  };

  const cancelInvitation = async (
    invitationId: number,
    requesterId: number,
  ) => {
    return await del<void>(
      `/api/teams/invitations/${invitationId}?requester_id=${requesterId}`,
      getSignal("cancelInvitation"),
    );
  };

  const removeMemberFromTeam = async (teamId: number, userId: number) => {
    return await del<{ message: string }>(
      `/api/teams/${teamId}/members/${userId}`,
      getSignal("removeMemberFromTeam"),
    );
  };

  const promoteToAdmin = async (teamId: number, userId: number) => {
    return await post<ITeam>(
      `/api/teams/${teamId}/admins/${userId}`,
      {},
      { isFormData: false, signal: getSignal("promoteToAdmin") },
    );
  };

  const demoteFromAdmin = async (teamId: number, userId: number) => {
    return await del<ITeam>(
      `/api/teams/${teamId}/admins/${userId}`,
      getSignal("demoteFromAdmin"),
    );
  };

  const deleteTeam = async (teamId: number, requesterId: number) => {
    return await del<void>(
      `/api/teams/${teamId}?requester_id=${requesterId}`,
      getSignal("deleteTeam"),
    );
  };

  // Notification APIs
  const getNotifications = async (userId: number) => {
    return await get<INotification[]>(
      `/api/notifications/user/${userId}`,
      getSignal("getNotifications"),
    );
  };

  const markNotificationRead = async (notificationId: number) => {
    return await patch<INotification>(
      `/api/notifications/${notificationId}/read`,
      {},
      { isFormData: false, signal: getSignal("markNotificationRead") },
    );
  };

  const deleteNotification = async (notificationId: number) => {
    return await del<void>(
      `/api/notifications/${notificationId}`,
      getSignal("deleteNotification"),
    );
  };

  // Team Announcements APIs
  const createAnnouncement = async ({
    team_id,
    author_id,
    title,
    message,
  }: CreateAnnouncementRequest) => {
    return await post<ITeamAnnouncement>(
      `/api/teams/${team_id}/announcements?author_id=${author_id}`,
      { title, message },
      { isFormData: false, signal: getSignal("createAnnouncement") },
    );
  };

  const getTeamAnnouncements = async (
    teamId: number,
    userId: number,
    skip = 0,
    limit = 50,
  ) => {
    return await get<ITeamAnnouncement[]>(
      `/api/teams/${teamId}/announcements?user_id=${userId}&skip=${skip}&limit=${limit}`,
      getSignal("getTeamAnnouncements"),
    );
  };

  const updateAnnouncement = async ({
    team_id,
    announcement_id,
    user_id,
    title,
    message,
  }: UpdateAnnouncementRequest) => {
    return await put<ITeamAnnouncement>(
      `/api/teams/${team_id}/announcements/${announcement_id}?user_id=${user_id}`,
      { title, message },
      { isFormData: false, signal: getSignal("updateAnnouncement") },
    );
  };

  const deleteAnnouncement = async (
    teamId: number,
    announcementId: number,
    userId: number,
  ) => {
    return await del<void>(
      `/api/teams/${teamId}/announcements/${announcementId}?user_id=${userId}`,
      getSignal("deleteAnnouncement"),
    );
  };

  const linkTeamProperty = async (teamId: number, propertyId: number) => {
    return await post<ITeam>(
      `/api/teams/${teamId}/properties/${propertyId}`,
      {},
      { signal: getSignal("linkTeamProperty") },
    );
  };

  const unlinkTeamProperty = async (teamId: number, propertyId: number) => {
    return await del<ITeam>(
      `/api/teams/${teamId}/properties/${propertyId}`,
      getSignal("unlinkTeamProperty"),
    );
  };

  const linkTeamBoard = async (teamId: number, boardId: number) => {
    return await post<ITeam>(
      `/api/teams/${teamId}/boards/${boardId}`,
      {},
      { signal: getSignal("linkTeamBoard") },
    );
  };

  const unlinkTeamBoard = async (teamId: number, propertyId: number) => {
    return await del<ITeam>(
      `/api/teams/${teamId}/boards/${propertyId}`,
      getSignal("unlinkTeamBoard"),
    );
  };

  const intakeCsv = async ({ file }: { file: File }) => {
    const formData = new FormData();
    formData.append("file", file);
    return await post<{
      leads_created: number[];
      leads_updated: number[];
      leads_unchanged: number[];
    }>(`/api/import-csv/`, formData, {
      isFormData: true,
      signal: getSignal("intakeCsv"),
    });
  };

  const sendVerificationCode = async ({ email }: SendVerificationCodeProps) => {
    return await post<SendVerificationCodeResponse>(
      `/api/verify/send-code`,
      { email },
      { isFormData: false, signal: getSignal("sendVerificationCode") },
    );
  };

  const verifyCode = async ({ email, code }: VerifyCodeProps) => {
    return await post<VerifyCodeResponse>(
      `/api/verify/confirm-code`,
      { email, code },
      { isFormData: false, signal: getSignal("verifyCode") },
    );
  };

  const getGmailSignature = async (userId: number) => {
    return await get<GmailSignatureResponse>(
      `/api/google-mail/signature/${userId}`,
      getSignal("getGmailSignature"),
    );
  };

  return {
    ...boardsApiRoutes,
    ...leadsContactsAddressApi,
    ...propertyApiRoutes,
    apiResponseError,
    createUser,
    getUserXp,
    addUserXP,
    restoreUserXp,
    linkContactToUser,
    loginAPI,
    getUsers,
    getUser,
    getUserTutorial,
    updateUserTutorial,
    getCampaign,
    getCampaigns,
    loginGoogle,
    sendTestEmail,
    listCampaignEmails,
    createCampaignEmailDraft,
    sendCampaignEmail,
    updateCampaignEmailDraft,
    deleteCampaignEmailDraft,
    listCampaigns,
    createCampaign,
    updateCampaign,
    setSignal,
    updateCampaignLead,
    smtpGetConfig,
    smtpSendEmail,
    // Team APIs
    getTeams,
    createTeam,
    getTeamMembersByXp,
    updateTeam,
    getTeamsByUser,
    getTeamMembers,
    closeTeamDeal,
    inviteToTeam,
    getTeamInvitations,
    respondToInvitation,
    cancelInvitation,
    removeMemberFromTeam,
    promoteToAdmin,
    demoteFromAdmin,
    deleteTeam,
    linkTeamProperty,
    unlinkTeamProperty,
    linkTeamBoard,
    unlinkTeamBoard,
    // Notification APIs
    getNotifications,
    markNotificationRead,
    deleteNotification,
    // Announcement APIs
    createAnnouncement,
    getTeamAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    intakeCsv,
    sendVerificationCode,
    verifyCode,
    getGmailSignature,
  };
};
