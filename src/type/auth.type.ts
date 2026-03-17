import { SystemRoleType } from "@prisma/client";

export interface IAuthUser {
  userId: string;
  systemRole: SystemRoleType;
}

declare module "fastify" {
  interface FastifyRequest {
    authUser?: IAuthUser;
  }
}
