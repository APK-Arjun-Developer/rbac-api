import { FastifySchema } from "fastify";
import { JSONSchema7 } from "json-schema";

/**
 * Standard error response schema
 */
const errorResponse: JSONSchema7 = {
  type: "object",
  properties: {
    statusCode: { type: "number" },
    error: { type: "string" },
    message: { type: "string" },
  },
  required: ["statusCode", "error", "message"],
};

/**
 * Common schema builder
 */
const buildSchema = (options: {
  tags: string[];
  params?: JSONSchema7;
  querystring?: JSONSchema7;
  body?: JSONSchema7;
  response200?: JSONSchema7;
}): FastifySchema => {
  return {
    ...(options.tags && { tags: options.tags }),
    ...(options.params && { params: options.params }),
    ...(options.querystring && {
      querystring: options.querystring,
    }),
    ...(options.body && { body: options.body }),

    response: {
      200: options.response200 ?? { type: "null" },
      400: errorResponse,
      404: errorResponse,
      409: errorResponse,
      500: errorResponse,
    },
  };
};

export { buildSchema };
