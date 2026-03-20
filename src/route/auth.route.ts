import { FastifyInstance } from "fastify";
import { authController } from "@controller";
import { loginSchema } from "@schema";
import type { ILoginRoute } from "@type";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<ILoginRoute>(
    "/login",
    { schema: loginSchema },
    authController.login.bind(authController),
  );
}
