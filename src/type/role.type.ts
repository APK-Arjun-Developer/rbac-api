import { Role } from "@prisma/client";
import { TExcludeFields } from "@type";

export type IRole = Omit<Role, TExcludeFields>;

export interface IRolePayload {
  name: string;
  description: string | null;
  permissionIds: string[];
}
