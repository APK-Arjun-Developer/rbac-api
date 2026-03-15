import { User } from "@prisma/client";
import { IAddressPayload, IAssetPayload, TExcludeFields } from "@type";

export type IUser = Omit<User, TExcludeFields>;

export interface ICreateUserPayload {
  address: IAddressPayload;
  profileAsset: IAssetPayload | null;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
}

export interface IUpdateUserPayload {
  addressId?: string;
  profileAssetId?: string | null;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface IUniqueUserFields {
  username?: string;
  email?: string | null;
  mobile?: string | null;
}

export interface IGetAllUsers {
  company: {
    id: string;
    name: string;
    isActive: boolean;
  };
  users: IUser[];
}
