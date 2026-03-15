import { FastifyInstance } from "fastify";
import { userController } from "@controller";
import {
  getAllUsersSchema,
  getCompanyUsersSchema,
  getUserByIdSchema,
  createCompanyUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from "@schema";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/all",
    { schema: getAllUsersSchema },
    userController.getAllUsers.bind(userController),
  );

  fastify.get(
    "/companies/:companyId",
    { schema: getCompanyUsersSchema },
    userController.getCompanyUsers.bind(userController),
  );

  fastify.get("/:id", { schema: getUserByIdSchema }, userController.getById.bind(userController));

  fastify.put("/:id", { schema: updateUserSchema }, userController.updateUser.bind(userController));

  fastify.delete(
    "/:id",
    { schema: deleteUserSchema },
    userController.deleteUser.bind(userController),
  );

  fastify.post(
    "/companies/:companyId/users",
    { schema: createCompanyUserSchema },
    userController.createCompanyUser.bind(userController),
  );
}
