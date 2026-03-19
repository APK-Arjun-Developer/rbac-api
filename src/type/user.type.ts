import { User } from "@prisma/client";
import {
  IAddressPayload,
  IAssetPayload,
  ICompanySummary,
  IPaginatedResponse,
  TExcludeFields,
} from "@type";

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

export interface IUpdateVerificationStatusPayload {
  isEmailVerified?: boolean | null;
  isMobileVerified?: boolean | null;
}

export interface ICompanyUsers {
  company: ICompanySummary | null;
  users: IUser[];
}

export type IGetAllUsers = ICompanyUsers;
export type IPaginatedCompanyUsers = IPaginatedResponse<ICompanyUsers>;
