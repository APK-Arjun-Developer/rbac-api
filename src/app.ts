import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { userRoutes } from "@route";
import { env } from "@config";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "@schema";

export const app = Fastify({ logger: true })
  .withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

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

app.register(userRoutes, { prefix: "/api/users" });
