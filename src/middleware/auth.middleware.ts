import { SystemRoleType } from "@prisma/client";
import { db, env } from "@config";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

type JwtPayload = {
  userId: string;
  systemRole: SystemRoleType;
};

function getBearerToken(req: FastifyRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
}

export async function authMiddleware(req: FastifyRequest, res: FastifyReply) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (!decoded.userId || !decoded.systemRole) {
      return res.status(401).send({ message: "Invalid token payload" });
    }

    req.authUser = {
      userId: decoded.userId,
      systemRole: decoded.systemRole,
    };
  } catch {
    return res.status(401).send({ message: "Invalid token" });
  }
}

export function requireRoles(roles: SystemRoleType[]) {
  return async (req: FastifyRequest, res: FastifyReply) => {
    if (!req.authUser) return res.status(401).send({ message: "Unauthorized" });

    if (!roles.includes(req.authUser.systemRole)) {
      return res.status(403).send({ message: "Forbidden" });
    }
  };
}

export function authorizeCompanyScopeByParam() {
  return async (req: FastifyRequest<{ Params: { companyId: string } }>, res: FastifyReply) => {
    if (!req.authUser) return res.status(401).send({ message: "Unauthorized" });

    if (req.authUser.systemRole === SystemRoleType.SYSTEM_ADMIN) {
      return;
    }

    if (req.authUser.systemRole !== SystemRoleType.COMPANY_ADMIN) {
      return res.status(403).send({ message: "Forbidden" });
    }

    const isInCompany = await db.userCompany.findFirst({
      where: {
        userId: req.authUser.userId,
        companyId: req.params.companyId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!isInCompany) {
      return res.status(403).send({ message: "Forbidden: company scope mismatch" });
    }
  };
}

export function authorizeUserAccess(options: { allowCompanyAdminDeleteOnlyCompanyUser?: boolean } = {}) {
  return async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply) => {
    if (!req.authUser) return res.status(401).send({ message: "Unauthorized" });

    const targetUserId = req.params.id;

    if (req.authUser.systemRole === SystemRoleType.SYSTEM_ADMIN) {
      return;
    }

    if (req.authUser.systemRole === SystemRoleType.COMPANY_USER) {
      if (req.authUser.userId !== targetUserId) {
        return res.status(403).send({ message: "Forbidden" });
      }
      return;
    }

    if (req.authUser.systemRole !== SystemRoleType.COMPANY_ADMIN) {
      return res.status(403).send({ message: "Forbidden" });
    }

    if (req.authUser.userId === targetUserId) {
      return;
    }

    const targetUser = await db.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true, systemRole: true },
    });

    if (!targetUser) {
      return res.status(404).send({ message: "User not found" });
    }

    if (targetUser.systemRole !== SystemRoleType.COMPANY_USER) {
      return res.status(403).send({ message: "Forbidden" });
    }

    if (options.allowCompanyAdminDeleteOnlyCompanyUser && targetUser.systemRole !== SystemRoleType.COMPANY_USER) {
      return res.status(403).send({ message: "Forbidden" });
    }

    const sameCompany = await db.userCompany.findFirst({
      where: {
        userId: req.authUser.userId,
        deletedAt: null,
        company: {
          userCompanies: {
            some: {
              userId: targetUserId,
              deletedAt: null,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!sameCompany) {
      return res.status(403).send({ message: "Forbidden" });
    }
  };
}
