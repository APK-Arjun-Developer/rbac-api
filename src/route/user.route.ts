import { SystemRoleType } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { userController } from "@controller";
import { authenticate, authorizeSelfOrRoles, authorizeSystemRoles } from "@middleware";
import {
  createCompanyAdminUserSchema,
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
  fastify.get(
    "/all",
    { preHandler: [authenticate, authorizeSystemRoles(SystemRoleType.SYSTEM_ADMIN)], schema: getAllUsersSchema },
    userController.getAllUsers.bind(userController),
  );

  fastify.get(
    "/company-users",
    {
      preHandler: [authenticate, authorizeSystemRoles(SystemRoleType.COMPANY_ADMIN)],
      schema: getCompanyUsersSchema,
    },
    userController.getCompanyUsers.bind(userController),
  );

  fastify.get(
    "/:id",
    {
      preHandler: [
        authenticate,
        authorizeSelfOrRoles(SystemRoleType.SYSTEM_ADMIN, SystemRoleType.COMPANY_ADMIN),
      ],
      schema: getUserByIdSchema,
    },
    userController.getById.bind(userController),
  );

  fastify.post(
    "/company-user",
    { preHandler: [authenticate, authorizeSystemRoles(SystemRoleType.COMPANY_ADMIN)], schema: createCompanyUserSchema },
    userController.createCompanyUser.bind(userController),
  );

  fastify.post(
    "/company-admin",
    { preHandler: [authenticate, authorizeSystemRoles(SystemRoleType.SYSTEM_ADMIN)], schema: createCompanyAdminUserSchema },
    userController.createCompanyAdminUser.bind(userController),
  );

  fastify.patch(
    "/:id",
    {
      preHandler: [
        authenticate,
        authorizeSelfOrRoles(SystemRoleType.SYSTEM_ADMIN, SystemRoleType.COMPANY_ADMIN),
      ],
      schema: updateUserSchema,
    },
    userController.updateUser.bind(userController),
  );

  fastify.patch(
    "/:id/unique",
    {
      preHandler: [
        authenticate,
        authorizeSelfOrRoles(SystemRoleType.SYSTEM_ADMIN, SystemRoleType.COMPANY_ADMIN),
      ],
      schema: updateUniqueFieldSchema,
    },
    userController.updateUniqueField.bind(userController),
  );

  fastify.patch(
    "/:id/verification",
    { preHandler: [authenticate, authorizeSystemRoles(SystemRoleType.SYSTEM_ADMIN, SystemRoleType.COMPANY_ADMIN)], schema: updateVerificationStatusSchema },
    userController.updateVerificationStatus.bind(userController),
  );

  fastify.delete(
    "/:id",
    { preHandler: [authenticate, authorizeSystemRoles(SystemRoleType.SYSTEM_ADMIN, SystemRoleType.COMPANY_ADMIN)], schema: deleteUserSchema },
    userController.deleteUser.bind(userController),
  );
}
