import { Permission } from "@prisma/client";
import { TExcludeFields } from "@type";

export type IPermission = Omit<Permission, TExcludeFields>;
