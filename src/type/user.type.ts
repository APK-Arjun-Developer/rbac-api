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
import { IIdParams, TExcludeFields } from "@type";

export type IUser = Omit<User, TExcludeFields>;

export type ICreateUserPayload = z.infer<typeof createUserBodySchema>;

export interface ICreateCompanyUserRoute {
  Body: ICreateUserPayload;
}

export type IUpdateUserPayload = z.infer<typeof updateUserBodySchema>;

export interface IUpdateUserRoute {
  Params: IIdParams;
  Body: IUpdateUserPayload;
}

export type IUniqueUserFields = z.infer<typeof uniqueFieldBodySchema>;

export interface IUpdateUniqueFieldRoute {
  Params: IIdParams;
  Body: IUniqueUserFields;
}

export type IUpdateVerificationStatusPayload = z.infer<typeof verificationBodySchema>;

export interface IUpdateVerificationStatusRoute {
  Params: IIdParams;
  Body: IUpdateVerificationStatusPayload;
}

export interface IGetUserByIdRoute {
  Params: IIdParams;
}

export type IUserResponse = z.infer<typeof userResponseSchema>;

export type IGetAllUsers = z.infer<typeof allUsersResponseSchema>;
