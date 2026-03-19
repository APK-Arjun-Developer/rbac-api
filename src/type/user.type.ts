import type { z } from "zod";
import { User } from "@prisma/client";
import {
  allUsersResponseSchema,
  createUserBodySchema,
  uniqueFieldBodySchema,
  updateUserBodySchema,
  userResponseSchema,
  verificationBodySchema,
} from "@schema";
import { TExcludeFields } from "@type";

export type IUser = Omit<User, TExcludeFields>;

export type ICreateUserPayload = z.infer<typeof createUserBodySchema>;

export type IUpdateUserPayload = z.infer<typeof updateUserBodySchema>;

export type IUniqueUserFields = z.infer<typeof uniqueFieldBodySchema>;

export type IUpdateVerificationStatusPayload = z.infer<typeof verificationBodySchema>;

export type IUserResponse = z.infer<typeof userResponseSchema>;

export type IGetAllUsers = z.infer<typeof allUsersResponseSchema>;
