import type { z } from "zod";
import type { SystemRoleType } from "@prisma/client";
import type { accessTokenResponseSchema, loginBodySchema } from "@schema";

export interface IJwtPayload {
  userId: string;
}

export type ILoginPayload = z.infer<typeof loginBodySchema>;

export type IAccessTokenResponse = z.infer<typeof accessTokenResponseSchema>;

export interface IAuthUser {
  userId: string;
  systemRole: SystemRoleType;
  companyId: string | null;
}

declare module "fastify" {
  interface FastifyRequest {
    authUser?: IAuthUser;
  }
}
