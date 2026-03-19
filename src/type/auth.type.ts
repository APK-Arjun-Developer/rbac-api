import { FastifyRequest } from "fastify";

export interface IJwtPayload {
  userId: string;
  role: string;
  companyId?: string;
  iat?: number;
  exp?: number;
}

export interface IAuthenticatedRequest extends FastifyRequest {
  user: IJwtPayload;
}
