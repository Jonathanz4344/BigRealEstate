import { useCallback, useEffect, useState } from "react";
import { type ILead, ALeadToILead } from "../../interfaces";
import {
  useBoardStore,
  useAddBoardStepLeadStore,
  useAuthStore,
} from "../../stores";
import { getBoardItemId } from "../../utils";
import { isValidString, Validation } from "../../validation";
import { useApi } from "../api";
import { useErrorSnack, useSetKeyInObject, useStepItems } from "../utils";
import { useDefaultAddressFormState, useImageCaroselState } from "../state";

const BASE_TEXT = "";

const DEFAULT_LEAD_MAP = new Map([
  ["buisness", BASE_TEXT],
  ["liscence", BASE_TEXT],
  ["notes", BASE_TEXT],
  ["website", BASE_TEXT],
]);

const DEFAULT_CONTACT_MAP = new Map([
  ["firstName", BASE_TEXT],
  ["lastName", BASE_TEXT],
  ["email", BASE_TEXT],
  ["phone", BASE_TEXT],
]);

export const useManualCreateLeadModalPage = ({
  parentOnConfirm,
}: {
  parentOnConfirm: (selectedIds?: number[]) => void;
}) => {
  const { step } = useBoardStore();
  const { selectedBoardItemIds, editBoardItemId } = useAddBoardStepLeadStore();
  const user = useAuthStore((state) => state.user);

  const {
    apiResponseError,
    createLead,
    addLeadImage,
    updateLead,
    editLeadImage,
    deleteLeadImage,
  } = useApi();
  const onValidationFail = useErrorSnack();

  const { boardItems, itemType } = useStepItems({ step });
  const editingBoardItem = boardItems.find((bItem) => {
    const id = getBoardItemId(bItem, itemType);
    return id !== -1 && id === editBoardItemId;
  }) as ILead | undefined;

  const {
    MAX_FILE_LIMIT,

    selectedImageIndex,
    setSelectedImageIndex,
    selectedImage,
    images,
    setImages,
    deletingImageIds,

    onAddFiles,
    onEditFile,
    onRemoveImage,
  } = useImageCaroselState();

  const [leadFormState, setLeadFormState] = useState(
    new Map(DEFAULT_LEAD_MAP.entries()),
  );
  const [
    addressFormState,
    setAddressFormState,
    DEFAULT_ADDRESS_MAP,
    isAddressValid,
  ] = useDefaultAddressFormState();
  const [contactFormState, setContactFormState] = useState(
    new Map(DEFAULT_CONTACT_MAP.entries()),
  );
  const [showBuisInputs, setShowBuisInputs] = useState(true);
  const [showAddyInputs, setShowAddyInputs] = useState(false);
  const [showContactInputs, setShowContactInputs] = useState(true);

  useEffect(() => {
    initEditLead();
  }, [editBoardItemId, boardItems?.length]);

  const setKeyInObject = useSetKeyInObject();

  const getKeyInObject = useCallback(
    (key: string, from: "buisness" | "address" | "contact") => {
      let state = leadFormState;

      if (from === "address") state = addressFormState;

      if (from === "contact") state = contactFormState;

      return state.get(key) ?? "";
    },
    [leadFormState, addressFormState, contactFormState],
  );

  const initEditLead = () => {
    if (!editingBoardItem) return;

    const showBuis =
      Validation.Object.isDefined(editingBoardItem.buisness) &&
      editingBoardItem.buisness.length > 0;
    let showContact = false;
    let showAddy = false;

    const leadFormInfo = new Map(DEFAULT_LEAD_MAP.entries());
    leadFormInfo.set("buisness", editingBoardItem.buisness ?? "");
    leadFormInfo.set("liscence", editingBoardItem.licenseNum ?? "");
    leadFormInfo.set("notes", editingBoardItem.notes ?? "");
    leadFormInfo.set("website", editingBoardItem.website ?? "");

    const contactFormInfo = new Map(DEFAULT_CONTACT_MAP.entries());
    if (editingBoardItem.contact) {
      showContact =
        (Validation.Object.isDefined(editingBoardItem.contact.email) &&
          editingBoardItem.contact.email.length > 0) ||
        (Validation.Object.isDefined(editingBoardItem.contact.phone) &&
          editingBoardItem.contact.phone.length > 0);
      contactFormInfo.set(
        "firstName",
        editingBoardItem.contact.firstName ?? "",
      );
      contactFormInfo.set("lastName", editingBoardItem.contact.lastName ?? "");
      contactFormInfo.set("email", editingBoardItem.contact.email ?? "");
      contactFormInfo.set("phone", editingBoardItem.contact.phone ?? "");
    }

    const addressFormInfo = new Map(DEFAULT_ADDRESS_MAP.entries());
    if (editingBoardItem.address) {
      showAddy =
        Validation.Object.isDefined(editingBoardItem.address.street1) &&
        editingBoardItem.address.street1.length > 0;
      addressFormInfo.set("street1", editingBoardItem.address.street1 ?? "");
      addressFormInfo.set("street2", editingBoardItem.address.street2 ?? "");
      addressFormInfo.set("city", editingBoardItem.address.city ?? "");
      addressFormInfo.set("zipcode", editingBoardItem.address.zipcode ?? "");
      addressFormInfo.set("state", editingBoardItem.address.state ?? "");
    }

    if (editingBoardItem.images) {
      setSelectedImageIndex(editingBoardItem.images.length > 0 ? 0 : -1);
      setImages(
        editingBoardItem.images.map((bImg, i) => ({
          order: Validation.Object.isDefined(bImg.sortOrder)
            ? (bImg.sortOrder as number)
            : i,
          image: bImg,
        })),
      );
    }

    setLeadFormState(leadFormInfo);
    setContactFormState(contactFormInfo);
    setAddressFormState(addressFormInfo);

    setShowBuisInputs(showBuis);
    setShowContactInputs(showContact);
    setShowAddyInputs(showAddy);
  };

  const toggleRequiredInputs = useCallback(
    (type: "buisness" | "contact") => () => {
      if (type === "buisness") {
        setShowBuisInputs((prev) => {
          const newVal = !prev;
          if (!newVal && !showContactInputs) setShowContactInputs(true);
          return newVal;
        });
      }

      if (type === "contact") {
        setShowContactInputs((prev) => {
          const newVal = !prev;
          if (!newVal && !showBuisInputs) setShowBuisInputs(true);
          return newVal;
        });
      }
    },
    [
      showContactInputs,
      setShowContactInputs,
      showBuisInputs,
      setShowBuisInputs,
    ],
  );

  const validateForm = (showSnack: boolean = true) => {
    if (showBuisInputs && !showContactInputs) {
      if (!isValidString(getKeyInObject("buisness", "buisness")))
        return onValidationFail("Missing buisness name", showSnack);
    }

    if (showContactInputs && !showBuisInputs) {
      if (!isValidString(getKeyInObject("firstName", "contact")))
        return onValidationFail("Missing contact first name", showSnack);
      if (!isValidString(getKeyInObject("lastName", "contact")))
        return onValidationFail("Missing contact last name", showSnack);
      const email = getKeyInObject("email", "contact");
      const phone = getKeyInObject("phone", "contact");
      if (!isValidString(email) && !isValidString(phone))
        return onValidationFail(
          "Contact must have an email or phone number",
          showSnack,
        );
      if (isValidString(email) && !email.includes("@"))
        return onValidationFail("Malformatted email", showSnack);
    }

    if (showAddyInputs) {
      if (!isAddressValid(showSnack)) return false;
    }

    if (showBuisInputs && showContactInputs) {
      let isBuisFilled = false;
      let isContactFilled = false;

      if (isValidString(getKeyInObject("buisness", "buisness")))
        isBuisFilled = true;

      if (
        isValidString(getKeyInObject("firstName", "contact")) &&
        isValidString(getKeyInObject("lastName", "contact")) &&
        (isValidString(getKeyInObject("email", "contact")) ||
          isValidString(getKeyInObject("phone", "contact")))
      )
        isContactFilled = true;

      if (!isBuisFilled && !isContactFilled)
        return onValidationFail("Missing required fields", showSnack);
    }

    return true;
  };

  const shouldCreateLeadObjects = () => {
    let allowContact = false;
    let allowAddress = false;

    if (showContactInputs && !showBuisInputs) {
      allowContact = true;
    }

    if (
      showBuisInputs &&
      (isValidString(getKeyInObject("email", "contact")) ||
        isValidString(getKeyInObject("phone", "contact")))
    ) {
      allowContact = true;
    }

    if (showAddyInputs) {
      allowAddress = true;
    }

    return { contact: allowContact, address: allowAddress };
  };

  const createFormLead = (createdBy: number): ILead => {
    const { contact: allowContact, address: allowAddress } =
      shouldCreateLeadObjects();
    return {
      leadId: editBoardItemId,
      contact: allowContact
        ? {
            contactId: editingBoardItem?.contact?.contactId ?? -1,
            firstName: getKeyInObject("firstName", "contact"),
            lastName: getKeyInObject("lastName", "contact"),
            email: getKeyInObject("email", "contact") || undefined,
            phone: getKeyInObject("phone", "contact") || undefined,
          }
        : undefined,
      address: allowAddress
        ? {
            addressId: editingBoardItem?.address?.addressId ?? -1,
            street1: getKeyInObject("street1", "address"),
            street2: getKeyInObject("street2", "address"),
            city: getKeyInObject("city", "address"),
            state: getKeyInObject("state", "address"),
            zipcode: getKeyInObject("zipcode", "address"),
            lat: 0,
            long: 0,
          }
        : undefined,
      buisness: getKeyInObject("buisness", "buisness"),
      notes: getKeyInObject("notes", "buisness"),
      licenseNum: getKeyInObject("liscence", "buisness"),
      website: getKeyInObject("website", "buisness"),
      personType: showBuisInputs && !showContactInputs ? "business" : "person",
      createdBy,
    };
  };

  const onConfirm = async () => {
    if (!validateForm() || !user || !step) return;

    const newLead = createFormLead(user.userId);

    let action = async () =>
      // TODO: API route for turning typed address into address with coordinates b4 sending to API to create lead
      // TODO: Speak about possibility of removing email validation or allowing email to be an empty string, API throws an error for empty email
      // TODO: BUG: Attempt to create contact with only an email filled in, API errors with duplicate phone value, FIX: allow null values for email/phone/firstname/lastname in DB as long as one of the keys is non null
      // TODO: Speak about possibility of duplicate error for firstname/lastname
      await createLead({
        lead: createFormLead(user.userId),
        createdById: user.userId,
      });

    if (editingBoardItem)
      // Switch to edit mode
      action = async () =>
        await updateLead({
          createdById: user.userId,
          newLead,
          ogLead: editingBoardItem,
        });

    const response = await action();

    if (response.err || !response.data)
      return (apiResponseError("creating a lead", response.err), []);

    const createdLead = ALeadToILead(response.data.lead);

    const newLeadIds = editingBoardItem
      ? selectedBoardItemIds // Edit mode
      : [...selectedBoardItemIds, createdLead.leadId]; // Create mode

    const filesOnly = images.filter((img) =>
      Validation.Object.isDefined(img.file),
    );
    const imgs = [];
    for await (const tempFile of filesOnly) {
      const newImage = {
        leadId: createdLead.leadId,
        file: tempFile.file!,
        sortOrder: tempFile.order.toString(),
        gallery: true,
      };

      let imageAction = async () => await addLeadImage(newImage);

      if (editingBoardItem && tempFile.image && tempFile.image.leadImageId)
        imageAction = async () =>
          // TODO: Editing a lead, causes sort order to be disrupted and continuously increase, ie loses sort order number of removed image and does not replace sort order with new image added
          await editLeadImage({
            newImage,
            ogImageId: tempFile.image!.leadImageId!,
          });

      const leadImage = await imageAction();
      imgs.push(leadImage);
    }

    for await (const imageId of deletingImageIds) {
      await deleteLeadImage({ imageId, leadId: createdLead.leadId });
    }

    parentOnConfirm(newLeadIds);
  };

  const onRemoveLeadFromStep = () => {
    parentOnConfirm(
      selectedBoardItemIds.filter(
        (boardItemId) => boardItemId !== editingBoardItem?.leadId,
      ),
    );
  };

  return {
    MAX_FILE_LIMIT,

    selectedBoardItemIds,

    editingBoardItem,

    selectedImageIndex,
    selectedImage,
    images,
    setSelectedImageIndex,
    onAddFiles,
    onEditFile,
    onRemoveImage,

    showBuisInputs,
    showContactInputs,
    showAddyInputs,
    toggleRequiredInputs,
    setShowAddyInputs,

    leadFormState,
    contactFormState,
    addressFormState,
    setKeyInObject,
    setLeadFormState,
    setContactFormState,
    setAddressFormState,

    onConfirm,
    onRemoveLeadFromStep,
  };
};
