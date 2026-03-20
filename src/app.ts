import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import {
  ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { authRoutes, userRoutes } from "@route";
import { env } from "@config";
import { AppError, LoggerService } from "@service";

const logger = new LoggerService("App");

export const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
    });
  }
  logger.error(`Unhandled error on ${request.method} ${request.url}`, error);

  return reply.status(500).send({
    error: "InternalServerError",
    message: "Internal server error",
  });
});

const swaggerServerURL = env.CODESPACE_URL || env.SERVER_URL;

app.register(swagger, {
  openapi: {
    info: {
      title: "RBAC API",
      description: "User Management APIs",
      version: "1.0.0",
    },
    servers: [{ url: swaggerServerURL }],
  },
  transform: jsonSchemaTransform,
});

app.register(swaggerUI, {
  routePrefix: env.SWAGGER_ROUTE,
});

app.register(authRoutes, { prefix: "/api/auth" });
app.register(userRoutes, { prefix: "/api/users" });
