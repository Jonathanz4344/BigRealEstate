import type {
  AContact,
  AUser,
  DemoData,
  DemoLocationResult,
} from "../../interfaces";
import type {
  CreateContactProps,
  CreateUserProps,
  LinkContactToUserProps,
  LoginAPIProps,
  LoginGoogleProps,
  SearchLeadsProps,
  SendTestEmailProps,
} from "./types";
import { useFetch } from "./useFetch";
import { DEFAULT_LEAD_SOURCES } from "../../stores";

export const useApi = () => {
  // const defaultResponse: APIResponse<unknown> = {
  //   data: null,
  //   err: "Method not implemented",
  // };
  const { post, get } = useFetch();

  const searchLeads = async ({ query, sources }: SearchLeadsProps) => {
    type CombinedSearchResponse = {
      requested_sources: string[];
      results: Record<string, any>;
      aggregated_leads?: any[];
      errors?: Record<string, string>;
    };

    const requestedSources =
      sources.length > 0 ? sources : [...DEFAULT_LEAD_SOURCES];

    const response = await post<CombinedSearchResponse>(`/api/searchLeads`, {
      location_text: query,
      sources: requestedSources,
    });

    if (response.err || !response.data) {
      return {
        data: null,
        err: response.err ?? "No data returned",
      };
    }

    const availableSources = requestedSources.filter(
      (source) => response.data.results?.[source]
    );
    const primarySource = availableSources[0] ?? requestedSources[0];
    const primaryResult =
      (primarySource && response.data.results?.[primarySource]) ?? {};

    const normalizeLead = (lead: any): DemoData => {
      const contact = lead?.contact ?? {};
      const addressValue = lead?.address ?? {};
      const street =
        (addressValue && typeof addressValue === "object" && addressValue.street_1) ||
        (typeof lead?.address === "string" ? lead.address : undefined) ||
        lead?.business ||
        "Unknown";

      const city =
        (addressValue && typeof addressValue === "object" && addressValue.city) || "";

      const state =
        (addressValue && typeof addressValue === "object" && addressValue.state) || "";

      const latitude =
        Number(
          (addressValue && typeof addressValue === "object" && addressValue.lat) ?? 0
        ) || 0;

      const longitude =
        Number(
          (addressValue && typeof addressValue === "object" && addressValue.long) ?? 0
        ) || 0;

      const fullAddress =
        city || state ? [street, [city, state].filter(Boolean).join(", ")].filter(Boolean).join(", ") : street;

      const agentName = [contact?.first_name, contact?.last_name]
        .filter((v) => v && v.length > 0)
        .join(" ")
        .trim();

      return {
        address: fullAddress || "Unknown",
        agent: agentName || lead?.business || "Unknown",
        contact: contact?.email || contact?.phone || "",
        price: lead?.notes || lead?.business || "N/A",
        bedrooms: 0,
        bathrooms: 0,
        latitude,
        longitude,
        distance_miles:
          typeof lead?.distance_miles === "number" ? lead.distance_miles : 0,
        source:
          typeof lead?.source === "string"
            ? (lead.source as DemoData["source"])
            : primarySource,
      };
    };

    const aggregatedLeads = Array.isArray(response.data.aggregated_leads)
      ? response.data.aggregated_leads.map(normalizeLead)
      : [];

    let nearby_properties: DemoData[] = [];
    if (aggregatedLeads.length > 0) {
      nearby_properties = aggregatedLeads;
    } else if (Array.isArray(primaryResult?.nearby_properties)) {
      nearby_properties = primaryResult.nearby_properties as DemoData[];
    } else if (Array.isArray(primaryResult?.leads)) {
      nearby_properties = primaryResult.leads.map(normalizeLead);
    }

    const findNormalizedLocation = (): DemoLocationResult | null => {
      for (const source of availableSources) {
        const candidate = response.data.results?.[source]?.normalized_location;
        if (candidate) return candidate as DemoLocationResult;
      }
      const fallback = Object.values(response.data.results ?? {}).find(
        (item) => item?.normalized_location
      ) as { normalized_location?: DemoLocationResult } | undefined;
      if (fallback?.normalized_location) return fallback.normalized_location;
      return null;
    };

    const normalized_location: DemoLocationResult =
      findNormalizedLocation() ?? {
        latitude: 0,
        longitude: 0,
        city: "",
        state: "",
        zip: "",
        source: primarySource ?? "google_places",
      };

    return {
      data: {
        normalized_location,
        nearby_properties,
      },
      err: null,
    };
  };

  const createContact = async (body: CreateContactProps) => {
    return await post<AContact>(`/api/contacts`, body);
  };

  const createUser = async (body: CreateUserProps) => {
    return await post<AUser>(`/api/users/`, body);
  };

  const linkContactToUser = async (body: LinkContactToUserProps) => {
    return await post<AUser>(
      `/api/users/${body.userId}/contacts/${body.contactId}`,
      {}
    );
  };

  const loginAPI = async (body: LoginAPIProps) => {
    return await post<AUser>(`/api/login`, body);
  };

  const getUser = async (userId: string) => {
    return await get<AUser>(`/api/users/${userId}`);
  };

  const loginGoogle = async ({ code, scope, targetUserId }: LoginGoogleProps) => {
    const payload: Record<string, unknown> = { code, scope };
    if (typeof targetUserId === "number") {
      payload.target_user_id = targetUserId;
    }
    return await post<AUser>(`/api/login/google`, payload);
  };

  const sendTestEmail = async ({
    userId,
    to,
    subject,
    html,
    fromName,
  }: SendTestEmailProps) => {
    type GmailResponse = { id: string; thread_id?: string };
    return await post<GmailResponse>(`/api/google-mail/send`, {
      user_id: userId,
      to,
      subject,
      html,
      from_name: fromName,
    });
  };

  return {
    searchLeads,
    createContact,
    createUser,
    linkContactToUser,
    loginAPI,
    getUser,
    loginGoogle,
    sendTestEmail,
  };
};
