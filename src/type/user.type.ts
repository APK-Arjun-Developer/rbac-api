import { User } from "@prisma/client";
import { ExcludeFields } from "./common.type";

export type IUser = Omit<User, ExcludeFields>;

export interface CreateUserPayload {
  addressId: string;
  profileAssetId: string | null;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
}

export interface UpdateUserPayload {
  addressId?: string;
  profileAssetId?: string | null;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UniqueUserFields {
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
