import type { z } from "zod";
import type { idParamsSchema } from "@schema";

export type TExcludeFields =
  | "createdAt"
  | "createdBy"
  | "updatedAt"
  | "updatedBy"
  | "deletedAt"
  | "deletedBy"
  | "password";

export type IIdParams = z.infer<typeof idParamsSchema>;
