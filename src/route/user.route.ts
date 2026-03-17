import { SystemRoleType } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { userController } from "@controller";
import {
  authMiddleware,
  authorizeCompanyScopeByParam,
  authorizeUserAccess,
  requireRoles,
} from "@middleware";
import {
  createCompanyAdminSchema,
  createCompanyUserSchema,
  deleteUserSchema,
  getAllUsersSchema,
  getCompanyUsersSchema,
  getUserByIdSchema,
  updateUniqueFieldSchema,
  updateUserSchema,
  updateVerificationStatusSchema,
} from "@schema";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get(
    "/all",
    {
      schema: getAllUsersSchema,
      preHandler: [requireRoles([SystemRoleType.SYSTEM_ADMIN])],
    },
    userController.getAllUsers.bind(userController),
  );

  fastify.get(
    "/companies/:companyId",
    {
      schema: getCompanyUsersSchema,
      preHandler: [
        requireRoles([SystemRoleType.SYSTEM_ADMIN, SystemRoleType.COMPANY_ADMIN]),
        authorizeCompanyScopeByParam(),
      ],
    },
    userController.getCompanyUsers.bind(userController),
  );

  fastify.get(
    "/:id",
    {
      schema: getUserByIdSchema,
      preHandler: [
        requireRoles([
          SystemRoleType.SYSTEM_ADMIN,
          SystemRoleType.COMPANY_ADMIN,
          SystemRoleType.COMPANY_USER,
        ]),
        authorizeUserAccess(),
      ],
    },
    userController.getById.bind(userController),
  );

  fastify.put(
    "/:id",
    {
      schema: updateUserSchema,
      preHandler: [
        requireRoles([
          SystemRoleType.SYSTEM_ADMIN,
          SystemRoleType.COMPANY_ADMIN,
          SystemRoleType.COMPANY_USER,
        ]),
        authorizeUserAccess(),
      ],
    },
    userController.updateUser.bind(userController),
  );

  fastify.patch(
    "/:id/unique",
    {
      schema: updateUniqueFieldSchema,
      preHandler: [
        requireRoles([
          SystemRoleType.SYSTEM_ADMIN,
          SystemRoleType.COMPANY_ADMIN,
          SystemRoleType.COMPANY_USER,
        ]),
        authorizeUserAccess(),
      ],
    },
    userController.updateUniqueField.bind(userController),
  );

  fastify.patch(
    "/:id/verification",
    {
      schema: updateVerificationStatusSchema,
      preHandler: [
        requireRoles([
          SystemRoleType.SYSTEM_ADMIN,
          SystemRoleType.COMPANY_ADMIN,
          SystemRoleType.COMPANY_USER,
        ]),
        authorizeUserAccess(),
      ],
    },
    userController.updateVerificationStatus.bind(userController),
  );

  fastify.delete(
    "/:id",
    {
      schema: deleteUserSchema,
      preHandler: [
        requireRoles([SystemRoleType.SYSTEM_ADMIN, SystemRoleType.COMPANY_ADMIN]),
        authorizeUserAccess({ allowCompanyAdminDeleteOnlyCompanyUser: true }),
      ],
    },
    userController.deleteUser.bind(userController),
  );

  fastify.post(
    "/company-admins",
    {
      schema: createCompanyAdminSchema,
      preHandler: [requireRoles([SystemRoleType.SYSTEM_ADMIN])],
    },
    userController.createCompanyAdminUser.bind(userController),
  );

  fastify.post(
    "/companies/:companyId/users",
    {
      schema: createCompanyUserSchema,
      preHandler: [
        requireRoles([SystemRoleType.SYSTEM_ADMIN, SystemRoleType.COMPANY_ADMIN]),
        authorizeCompanyScopeByParam(),
      ],
    },
    userController.createCompanyUser.bind(userController),
  );
}
