import { FastifyInstance } from "fastify";
import { authController } from "@controller";
import { loginSchema } from "@schema";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/login", { schema: loginSchema }, authController.login.bind(authController));
}
