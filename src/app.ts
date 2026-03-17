import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { userRoutes } from "@route";
import { env } from "@config";
import { AppError } from "@service";

export const app = Fastify({ logger: true });

const swaggerServerURL = env.CODESPACE_URL || env.SERVER_URL;

app.register(helmet, {
  global: true,
});

app.register(cors, {
  origin: true,
  credentials: true,
});

app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

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

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  if ((error as { validation?: unknown }).validation) {
    return reply.status(400).send({
      message: "Validation error",
      details: (error as { message: string }).message,
    });
  }

  return reply.status(500).send({
    message: "Internal server error",
  });
});

app.setNotFoundHandler((_request, reply) => {
  return reply.status(404).send({
    message: "Route not found",
  });
});

// Register routes
app.register(userRoutes, { prefix: "/api/users" });
