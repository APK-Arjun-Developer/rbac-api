import { z } from "zod";
import type { FastifySchema } from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

export { jsonSchemaTransform, serializerCompiler, validatorCompiler };

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const commonErrors = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  403: errorResponseSchema,
  404: errorResponseSchema,
  409: errorResponseSchema,
  500: errorResponseSchema,
} satisfies Record<number, z.ZodTypeAny>;

export const buildSuccessResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    message: z.string(),
    data,
  });

type BuildSchemaOptions = {
  tags?: string[];
  params?: z.ZodTypeAny;
  querystring?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
  response?: Partial<Record<number, z.ZodTypeAny>>;
};

export const buildSchema = (options: BuildSchemaOptions): FastifySchema => ({
  ...(options.tags && { tags: options.tags }),
  ...(options.params && { params: options.params }),
  ...(options.querystring && { querystring: options.querystring }),
  ...(options.body && { body: options.body }),
  response: {
    ...options.response,
    ...commonErrors,
  },
});

export const idParamsSchema = z.object({
  id: z.string().uuid(),
});
