import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { userRoutes } from "./route/user.route";
import { env } from "./config/env";

export const app = Fastify({ logger: true });

const swaggerServerURL = env.CODESPACE_URL || env.SERVER_URL;

// Register Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: "RBAC API",
      description: "User Management APIs",
      version: "1.0.0",
    },
    servers: [{ url: swaggerServerURL }],
  },
});

app.register(swaggerUI, {
  routePrefix: env.SWAGGER_ROUTE,
});

// Register routes
app.register(userRoutes, { prefix: "/api/users" });
