import { FastifyInstance } from "fastify";
import { userController } from "../controller/user.controller";
import {
  createCompanyUserSchema,
  updateUserSchema,
  idParamSchema,
  companyParamSchema,
} from "../schema/user.schema";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/all", userController.getAllUsers.bind(userController));

  fastify.get(
    "/:id",
    {
      schema: idParamSchema,
    },
    userController.getById.bind(userController),
  );

  fastify.get(
    "/companies/:companyId",
    {
      schema: companyParamSchema,
    },
    userController.getCompanyUsers.bind(userController),
  );

  fastify.put(
    "/:id",
    {
      schema: updateUserSchema,
    },
    userController.updateUser.bind(userController),
  );

  fastify.delete(
    "/:id",
    {
      schema: idParamSchema,
    },
    userController.deleteUser.bind(userController),
  );

  fastify.post(
    "/companies/:companyId/users",
    {
      schema: createCompanyUserSchema,
    },
    userController.createCompanyUser.bind(userController),
  );
}
