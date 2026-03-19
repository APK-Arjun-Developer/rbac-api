import { FastifySchema } from "fastify";
import { JSONSchema7 } from "json-schema";

/* ---------------- ERROR SCHEMA ---------------- */

const errorResponse: JSONSchema7 = {
  type: "object",
  properties: {
    statusCode: { type: "number" },
    error: { type: "string" },
    message: { type: "string" },
  },
  required: ["statusCode", "error", "message"],
};

/* ---------------- COMMON RESPONSES ---------------- */

const commonErrors = {
  400: errorResponse,
  401: errorResponse,
  403: errorResponse,
  404: errorResponse,
  409: errorResponse,
  500: errorResponse,
};

/* ---------------- SCHEMA BUILDER ---------------- */

interface BuildSchemaOptions {
  tags?: string[];
  params?: JSONSchema7;
  querystring?: JSONSchema7;
  body?: JSONSchema7;
  response?: Record<number, JSONSchema7>;
}

export const buildSchema = (options: BuildSchemaOptions): FastifySchema => {
  return {
    ...(options.tags && { tags: options.tags }),
    ...(options.params && { params: options.params }),
    ...(options.querystring && { querystring: options.querystring }),
    ...(options.body && { body: options.body }),

    response: {
      ...options.response,
      ...commonErrors,
    },
  };
};

/* ---------------- COMMON PARAMS ---------------- */

export const idParams: JSONSchema7 = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
};
