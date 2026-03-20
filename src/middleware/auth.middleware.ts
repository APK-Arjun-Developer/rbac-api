import jwt from "jsonwebtoken";
import { SystemRoleType } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { env } from "@config";
import { ForbiddenError, UnauthorizedError, authService } from "@service";

function getBearerToken(request: FastifyRequest) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Unauthorized");
  }

  return authorization.slice(7).trim();
}

export async function authenticate(request: FastifyRequest) {
  const token = getBearerToken(request);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (!payload || typeof payload === "string") {
      throw new UnauthorizedError("Invalid token");
    }

    if (!payload?.userId) {
      throw new UnauthorizedError("Invalid token");
    }

    request.authUser = await authService.getAuthUser(payload.userId);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    throw new UnauthorizedError("Invalid token");
  }
}

export function authorizeSystemRoles(...roles: SystemRoleType[]) {
  return async (request: FastifyRequest) => {
    if (!request.authUser) {
      throw new UnauthorizedError("Unauthorized");
    }

    if (!roles.includes(request.authUser.systemRole)) {
      throw new ForbiddenError("Forbidden");
    }
  };
}

function getRequestParamId(request: FastifyRequest) {
  if (!request.params || typeof request.params !== "object") {
    return undefined;
  }

  const { id } = request.params as Record<string, unknown>;
  return typeof id === "string" ? id : undefined;
}

export function authorizeSelfOrRoles(...roles: SystemRoleType[]) {
  return async (request: FastifyRequest) => {
    if (!request.authUser) {
      throw new UnauthorizedError("Unauthorized");
    }

    const routeUserId = getRequestParamId(request);

    if (routeUserId && routeUserId === request.authUser.userId) {
      return;
    }

    if (roles.includes(request.authUser.systemRole)) {
      return;
    }

    throw new ForbiddenError("Forbidden");
  };
}
