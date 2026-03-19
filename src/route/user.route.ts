import { FastifyInstance } from "fastify";
import { userController } from "@controller";
import {
  getAllUsersSchema,
  getCompanyUsersSchema,
  getUserByIdSchema,
  createCompanyUserSchema,
  createCompanyAdminUserSchema,
  updateUserSchema,
  updateUniqueFieldSchema,
  updateVerificationStatusSchema,
  deleteUserSchema,
} from "@schema";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/all",
    { schema: getAllUsersSchema },
    userController.getAllUsers.bind(userController),
  );

  fastify.get(
    "/company-users",
    { schema: getCompanyUsersSchema },
    userController.getCompanyUsers.bind(userController),
  );

  fastify.get("/:id", { schema: getUserByIdSchema }, userController.getById.bind(userController));

  fastify.post(
    "/company-user",
    { schema: createCompanyUserSchema },
    userController.createCompanyUser.bind(userController),
  );

  fastify.post(
    "/company-admin",
    { schema: createCompanyAdminUserSchema },
    userController.createCompanyAdminUser.bind(userController),
  );

  fastify.patch(
    "/:id",
    { schema: updateUserSchema },
    userController.updateUser.bind(userController),
  );

  fastify.patch(
    "/:id/unique",
    { schema: updateUniqueFieldSchema },
    userController.updateUniqueField.bind(userController),
  );

  fastify.patch(
    "/:id/verification",
    { schema: updateVerificationStatusSchema },
    userController.updateVerificationStatus.bind(userController),
  );

  fastify.delete(
    "/:id",
    { schema: deleteUserSchema },
    userController.deleteUser.bind(userController),
  );
}
