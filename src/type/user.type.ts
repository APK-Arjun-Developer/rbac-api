import { AssetStorageType, User } from "@prisma/client";
import { TExcludeFields } from "./common.type";

export type IUser = Omit<User, TExcludeFields>;

export interface IAddressPayload {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface IAssetPayload {
  originalName: string;
  uploadedName: string;
  fileFormat: string;
  storageType: AssetStorageType;
  relativePath: string;
}

export interface IRolePayload {
  name: string;
  description: string | null;
  permissionIds: string[];
}

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

export interface ICreateCompanyPayload {
  address: IAddressPayload;
  profileAsset: IAssetPayload | null;
  roles: IRolePayload[];
  name: string;
}

export interface ICreateCompanyAdminUserPayload {
  user: ICreateUserPayload;
  company: ICreateCompanyPayload;
  roles: IRolePayload[];
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
