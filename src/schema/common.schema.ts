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

export const paginationQuerySchema: JSONSchema7 = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1 },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
  additionalProperties: false,
};

export const buildPaginatedResponseSchema = (itemSchema: JSONSchema7): JSONSchema7 => ({
  type: "object",
  properties: {
    items: {
      type: "array",
      items: itemSchema,
    },
    meta: {
      type: "object",
      properties: {
        page: { type: "integer" },
        limit: { type: "integer" },
        total: { type: "integer" },
        totalPages: { type: "integer" },
      },
      required: ["page", "limit", "total", "totalPages"],
    },
  },
  required: ["items", "meta"],
});

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
