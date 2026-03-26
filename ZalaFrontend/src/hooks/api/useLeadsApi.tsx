import type {
  APIHookProps,
  APIResponse,
  CreateLeadImageProps,
  CreateLeadProps,
  SearchLeadsProps,
  SearchLeadsResponse,
  UpdateLeadProps,
} from "./types";
import { useFetch } from "./useFetch";
import type {
  ALead,
  AContact,
  AAddress,
  AImage,
  AUser,
} from "../../interfaces";
import { useAddressApi } from "./useAddressApi";
import { useContactApi } from "./useContactApi";
import { Normalizer } from "../../utils";

export const useLeadsApi = (props: APIHookProps) => {
  const { getSignal, idsToQueryString } = props;
  const { post, get, put, del } = useFetch();

  const addressApi = useAddressApi(props);
  const contactApi = useContactApi(props);

  const { createAddress, editAddress, deleteAddress } = addressApi;
  const { createContact, editContact, deleteContact } = contactApi;

  const createLead = async ({
    lead,
    createdById: _userId,
  }: CreateLeadProps): Promise<APIResponse<{ lead: ALead }>> => {
    let createdLead: ALead | undefined = undefined;
    let createdContact: AContact | undefined = undefined;
    let createdAddress: AAddress | undefined = undefined;

    const errorOut = (msg: string | null, backup: string) => {
      throw new Error(msg ?? backup);
    };

    const createData = async (): Promise<
      [ALead, AContact | undefined, AAddress | undefined]
    > => {
      let apiContact: AContact | undefined = undefined;
      let apiAddress: AAddress | undefined = undefined;

      const leadRes = await post<ALead>(
        `/api/leads`,
        {
          person_type: lead.personType,
          business: lead.buisness,
          website: lead.website,
          license_num: lead.licenseNum,
          notes: lead.notes,
        },
        { isFormData: false, signal: getSignal("createData") },
      );
      if (leadRes.err || !leadRes.data)
        return errorOut(leadRes.err, "Creating lead api failed");
      const apiLead = leadRes.data;
      createdLead = leadRes.data;

      if (lead.contact) {
        const contactRes = await createContact({
          email: lead.contact.email,
          phone: lead.contact.phone,
          first_name: lead.contact.firstName,
          last_name: lead.contact.lastName,
        });
        if (contactRes.err || !contactRes.data)
          return errorOut(contactRes.err, "Creating contact api failed");
        apiContact = contactRes.data;
        createdContact = contactRes.data;
      }

      if (lead.address) {
        const addressRes = await createAddress({ address: lead.address });
        if (addressRes.err || !addressRes.data)
          return errorOut(addressRes.err, "Creating address api failed");
        apiAddress = addressRes.data;
        createdAddress = addressRes.data;
      }

      return [apiLead, apiContact, apiAddress];
    };

    const connectData = async ([apiLead, apiContact, apiAddress]: [
      ALead,
      AContact | undefined,
      AAddress | undefined,
    ]) => {
      let updatedLead = apiLead;

      if (apiContact) {
        const contactRes = await linkContactToLead({
          leadId: apiLead.lead_id,
          contactId: apiContact.contact_id,
        });
        if (contactRes.err || !contactRes.data)
          return errorOut(contactRes.err, "Contact link to lead api failed");

        updatedLead = contactRes.data;
      }

      if (apiAddress) {
        const addressRes = await linkAddressToLead({
          leadId: apiLead.lead_id,
          addressId: apiAddress.address_id,
        });
        if (addressRes.err || !addressRes.data)
          return errorOut(addressRes.err, "Address link to lead api failed");

        updatedLead = addressRes.data;
      }

      // const userRes = await linkUserToLead({
      //   leadId: apiLead.lead_id,
      //   userId: createdById,
      // });
      // if (userRes.err || !userRes.data)
      //   return errorOut(contactRes.err, "User link to lead api failed");

      return updatedLead;
    };

    const deleteData = async () => {
      if (createdLead) {
        await deleteLead({ leadId: createdLead.lead_id });
      }

      if (createdContact) {
        await deleteContact({ contactId: createdContact.contact_id });
      }

      if (createdAddress) {
        await deleteAddress({ addressId: createdAddress.address_id });
      }
    };

    try {
      const createdParts = await createData();
      const createdLead = await connectData(createdParts);
      return { data: { lead: createdLead }, err: null };
    } catch (e) {
      try {
        await deleteData();
      } catch (err) {
        console.log(`Lead failed to create - Lead failed to delete`);
      }

      if (e instanceof Error) return { err: e.message, data: null };
      if (typeof e === "string") return { err: e, data: null };
      return { err: "Internal error creating lead", data: null };
    }
  };

  const linkContactToLead = async ({
    leadId,
    contactId,
  }: {
    leadId: number;
    contactId: number;
  }) => {
    return await post<ALead>(
      `/api/leads/${leadId}/contacts/${contactId}`,
      {},
      { isFormData: false, signal: getSignal("linkContactToLead") },
    );
  };

  const linkAddressToLead = async ({
    leadId,
    addressId,
  }: {
    leadId: number;
    addressId: number;
  }) => {
    return await post<ALead>(
      `/api/leads/${leadId}/addresses/${addressId}`,
      {},
      { isFormData: false, signal: getSignal("linkAddressToLead") },
    );
  };

  const linkUserToLead = async ({
    leadId,
    userId,
  }: {
    leadId: number;
    userId: number;
  }) => {
    return await post<ALead>(
      `/api/leads/${leadId}/users/${userId}`,
      {},
      { isFormData: false, signal: getSignal("linkUserToLead") },
    );
  };

  const linkUserToProperty = async ({
    userId,
    propertyId,
  }: {
    userId: number;
    propertyId: number;
  }) => {
    return await post<AUser>(
      `/api/users/${userId}/properties/${propertyId}`,
      {},
      { isFormData: false, signal: getSignal("linkUserToProperty") },
    );
  };

  const unlinkUserFromProperty = async ({
    userId,
    propertyId,
  }: {
    userId: number;
    propertyId: number;
  }) => {
    return await del(
      `/api/users/${userId}/properties/${propertyId}`,
      getSignal("unlinkUserFromProperty"),
    );
  };

  const updateLead = async ({
    // createdById,
    newLead,
    ogLead,
  }: UpdateLeadProps) => {
    let touchedLead: ALead | undefined = undefined;
    let touchedContact: AContact | undefined = undefined;
    let touchedAddress: AAddress | undefined = undefined;

    // OG value must not exist to CREATE new value
    const shouldCreateContact =
      newLead.contact && !ogLead.contact ? true : false;
    const shouldCreateAddress =
      newLead.address && !ogLead.address ? true : false;

    const errorOut = (msg: string | null, backup: string) => {
      throw new Error(msg ?? backup);
    };

    const createData = async (): Promise<
      [ALead, AContact | undefined, AAddress | undefined]
    > => {
      let apiContact: AContact | undefined = undefined;
      let apiAddress: AAddress | undefined = undefined;

      const leadRes = await put<ALead>(
        `/api/leads/${newLead.leadId}`,
        {
          person_type: newLead.personType ?? ogLead.personType,
          business: newLead.buisness ?? ogLead.buisness,
          website: newLead.website ?? ogLead.website,
          license_num: newLead.licenseNum ?? ogLead.licenseNum,
          notes: newLead.notes ?? ogLead.notes,
          image_url: newLead.imageUrl ?? ogLead.imageUrl,
        },
        { isFormData: false, signal: getSignal("createData") },
      );
      if (leadRes.err || !leadRes.data)
        return errorOut(leadRes.err, "Edit lead api failed");

      const apiLead = leadRes.data;
      touchedLead = leadRes.data;

      if (newLead.contact) {
        // Edit or Create
        const action = async () =>
          await (shouldCreateContact
            ? createContact({
                email: newLead.contact!.email,
                phone: newLead.contact!.phone,
                first_name: newLead.contact!.firstName,
                last_name: newLead.contact!.lastName,
              })
            : editContact({
                newContact: newLead.contact!,
                ogContact: ogLead.contact!,
              }));

        const contactRes = await action();
        if (contactRes.err || !contactRes.data)
          return errorOut(contactRes.err, "Edit lead contact api failed");
        apiContact = contactRes.data;
        touchedContact = contactRes.data;
      }

      if (newLead.address) {
        // Edit or Create
        const action = async () =>
          await (shouldCreateAddress
            ? createAddress({ address: newLead.address! })
            : editAddress({
                newAddress: newLead.address!,
                ogAddress: ogLead.address!,
              }));

        const addressRes = await action();
        if (addressRes.err || !addressRes.data)
          return errorOut(addressRes.err, "Edit lead address api failed");
        apiAddress = addressRes.data;
        touchedAddress = addressRes.data;
      }

      return [apiLead, apiContact, apiAddress];
    };

    const connectData = async ([apiLead, apiContact, apiAddress]: [
      ALead,
      AContact | undefined,
      AAddress | undefined,
    ]) => {
      let updatedLead = apiLead;

      if (shouldCreateContact && apiContact) {
        const contactRes = await linkContactToLead({
          leadId: apiLead.lead_id,
          contactId: apiContact.contact_id,
        });
        if (contactRes.err || !contactRes.data)
          return errorOut(contactRes.err, "Contact link to lead api failed");

        updatedLead = contactRes.data;
      }

      if (shouldCreateAddress && apiAddress) {
        const addressRes = await linkAddressToLead({
          leadId: apiLead.lead_id,
          addressId: apiAddress.address_id,
        });
        if (addressRes.err || !addressRes.data)
          return errorOut(addressRes.err, "Address link to lead api failed");

        updatedLead = addressRes.data;
      }

      return updatedLead;
    };

    const revertData = async () => {
      if (touchedLead) {
        // Revert main lead data
        await put<ALead>(
          `/api/leads/${newLead.leadId}`,
          {
            person_type: ogLead.personType,
            business: ogLead.buisness,
            website: ogLead.website,
            license_num: ogLead.licenseNum,
            notes: ogLead.notes,
            image_url: ogLead.imageUrl,
          },
          { isFormData: false, signal: getSignal("createData") },
        );
      }

      if (touchedContact) {
        // Decide wether to revert or delete
        const action = async () =>
          await (shouldCreateContact
            ? deleteContact({ contactId: touchedContact!.contact_id })
            : editContact({
                newContact: ogLead.contact!,
                ogContact: ogLead.contact!,
              }));

        // If linked unlink
        if (shouldCreateContact)
          await del(
            `/api/leads/${ogLead.leadId}/contacts/${touchedContact.contact_id}`,
          );

        await action();
      }

      if (touchedAddress) {
        // Decide wether to revert or delete
        const action = async () =>
          await (shouldCreateContact
            ? deleteAddress({ addressId: touchedAddress!.address_id })
            : editAddress({
                newAddress: ogLead.address!,
                ogAddress: ogLead.address!,
              }));

        // If linked unlink
        if (shouldCreateAddress)
          await del(
            `/api/leads/${ogLead.leadId}/addresses/${touchedAddress.address_id}`,
          );

        await action();
      }
    };

    try {
      const createdParts = await createData();
      const createdLead = await connectData(createdParts);
      return { data: { lead: createdLead }, err: null };
    } catch (e) {
      try {
        await revertData();
      } catch (err) {
        console.log(`Lead failed to edit - Lead failed to revert/delete`);
        console.log(``);
      }

      if (e instanceof Error) return { err: e.message, data: null };
      if (typeof e === "string") return { err: e, data: null };
      return { err: "Internal error editing lead", data: null };
    }
  };

  const addLeadImage = async ({
    leadId,
    caption,
    sortOrder,
    file,
    gallery = true,
  }: CreateLeadImageProps) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption !== undefined) formData.append("caption", caption);
    if (sortOrder !== undefined) formData.append("sortOrder", sortOrder);
    return await post<AImage>(
      `/api/leads/${leadId}/image${gallery ? "s" : ""}`,
      formData,
      { isFormData: true, signal: getSignal("addLeadImage") },
    );
  };

  const editLeadImage = async ({
    newImage,
    ogImageId,
  }: {
    newImage: CreateLeadImageProps;
    ogImageId: number;
  }) => {
    await deleteLeadImage({ imageId: ogImageId, leadId: newImage.leadId });
    return await addLeadImage(newImage);
  };

  const deleteLeadImage = async ({
    imageId,
    leadId,
  }: {
    imageId: number;
    leadId: number;
  }) => {
    return await del(
      `/api/leads/${leadId}/images/${imageId}`,
      getSignal("deleteLeadImage"),
    );
  };

  const getLeads = async (leadIds: number[], _userId: number | string) => {
    return await get<ALead[]>(
      `/api/leads?${idsToQueryString(leadIds, "lead_ids")}`,
      getSignal("getLeads"),
    );
  };

  const getLead = async (leadId: number, _userId: number) => {
    return await get<ALead>(`/api/leads/${leadId}`, getSignal("getLead"));
  };

  const searchLeads = async ({ query }: SearchLeadsProps) => {
    const response = await post<SearchLeadsResponse>(
      `/api/searchLeads`,
      {
        location_text: query,
      },
      { isFormData: false, signal: getSignal("searchLeads") },
    );

    if (response.err || !response.data) {
      return {
        data: null,
        err: response.err ?? "No data returned",
      };
    }

    const nearby_properties = Array.isArray(response.data.aggregated_leads)
      ? response.data.aggregated_leads.map(Normalizer.APINormalizer.sourceLead)
      : [];

    const nearbyPropertyPins = Array.isArray(response.data.nearby_properties)
      ? response.data.nearby_properties.map((p) => ({
          propertyId: p.property_id,
          propertyName: p.property_name ?? "Property",
          address: {
            lat: p.address.lat,
            long: p.address.long,
            street1: p.address.street_1,
            city: p.address.city,
            state: p.address.state,
            zipcode: p.address.zipcode,
          },
          distanceMiles: p.distance_miles,
          source: "user_property" as const,
        }))
      : [];

    return {
      data: {
        nearby_properties,
        nearbyPropertyPins,
        external_persistence: response.data.external_persistence ?? {},
        errors: response.data.errors ?? {},
      },
      err: null,
    };
  };

  const deleteLead = async ({ leadId }: { leadId: number }) => {
    return await del(`/api/leads/${leadId}`, getSignal("deleteLead"));
  };

  return {
    ...addressApi,
    ...contactApi,
    createLead,
    addLeadImage,
    editLeadImage,
    deleteLeadImage,
    linkContactToLead,
    linkAddressToLead,
    linkUserToLead,
    linkUserToProperty,
    unlinkUserFromProperty,
    updateLead,
    getLeads,
    getLead,
    searchLeads,
    deleteLead,
  };
};
