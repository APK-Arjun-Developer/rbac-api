import { Asset, AssetStorageType } from "@prisma/client";
import { TExcludeFields } from "@type";

export type IAsset = Omit<Asset, TExcludeFields>;

export interface IAssetPayload {
  originalName: string;
  uploadedName: string;
  fileFormat: string;
  storageType: AssetStorageType;
  relativePath: string;
}
