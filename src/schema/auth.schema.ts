import { z } from "zod";
import { buildSchema, buildSuccessResponseSchema } from "@schema";

export const loginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const accessTokenResponseSchema = z.object({
  accessToken: z.string(),
});

const tags = ["Auth"];

export const loginSchema = buildSchema({
  tags,
  body: loginBodySchema,
  response: {
    200: buildSuccessResponseSchema(accessTokenResponseSchema),
  },
});
