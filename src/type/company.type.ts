import { Company } from "@prisma/client";
import {
  TExcludeFields,
  IAddressPayload,
  IAssetPayload,
  ICreateUserPayload,
  IRolePayload,
} from "@type";

export type ICompany = Omit<Company, TExcludeFields>;

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
