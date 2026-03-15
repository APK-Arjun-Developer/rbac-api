import { Address } from "@prisma/client";
import { TExcludeFields } from "@type";

export type IAddress = Omit<Address, TExcludeFields>;

export interface IAddressPayload {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  state: string;
  pincode: string;
}
