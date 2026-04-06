import type { APIHookProps } from "./types";
import type { IAddress, AAddress } from "../../interfaces";
import { useFetch } from "./useFetch";

export const useAddressApi = ({ getSignal }: APIHookProps) => {
  const { post, put, del } = useFetch();

  const createAddress = async ({
    address,
  }: {
    address: Omit<IAddress, "addressId">;
  }) => {
    return await post<AAddress>(
      `/api/addresses`,
      {
        street_1: address.street1,
        street_2: address.street2,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        lat: address.lat,
        long: address.long,
      },
      { isFormData: false, signal: getSignal("createAddress") }
    );
  };

  const editAddress = async ({
    newAddress,
    ogAddress,
  }: {
    newAddress: Partial<IAddress> & { addressId: number };
    ogAddress: IAddress;
  }) => {
    return put<AAddress>(
      `/api/addresses/${newAddress.addressId}`,
      {
        street_1: newAddress.street1 ?? ogAddress.street1,
        street_2: newAddress.street2 ?? ogAddress.street2,
        city: newAddress.city ?? ogAddress.city,
        state: newAddress.state ?? ogAddress.state,
        zipcode: newAddress.zipcode ?? ogAddress.zipcode,
        lat: newAddress.lat ?? ogAddress.lat,
        long: newAddress.long ?? ogAddress.long,
      },
      { isFormData: false, signal: getSignal("editAddress") }
    );
  };

  const deleteAddress = async ({ addressId }: { addressId: number }) => {
    return await del(`/api/addresses/${addressId}`, getSignal("deleteAddress"));
  };

  return {
    createAddress,
    editAddress,
    deleteAddress,
  };
};
