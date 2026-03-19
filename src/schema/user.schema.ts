import { z } from "zod";
import { AssetStorageType } from "@prisma/client";
import { buildSchema, buildSuccessResponseSchema, idParamsSchema } from "@schema";

const addressPayloadSchema = z.object({
  addressLine1: z.string().min(1),
  addressLine2: z.string().nullable(),
  city: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
});

const assetPayloadSchema = z.object({
  originalName: z.string().min(1),
  uploadedName: z.string().min(1),
  fileFormat: z.string().min(1),
  storageType: z.nativeEnum(AssetStorageType),
  relativePath: z.string().min(1),
});

const rolePayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  permissionIds: z.array(z.string().uuid()),
});

const createUserBodySchema = z.object({
  address: addressPayloadSchema,
  profileAsset: assetPayloadSchema.nullable(),
  username: z.string().min(1),
  password: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().nullable(),
  mobile: z.string().min(1).nullable(),
});

const createCompanyPayloadSchema = z.object({
  address: addressPayloadSchema,
  profileAsset: assetPayloadSchema.nullable(),
  roles: z.array(rolePayloadSchema),
  name: z.string().min(1),
});

const createCompanyAdminUserBodySchema = z.object({
  company: createCompanyPayloadSchema,
  user: createUserBodySchema,
  roles: z.array(rolePayloadSchema),
});

const updateUserBodySchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  addressId: z.string().uuid().optional(),
  profileAssetId: z.string().uuid().nullable().optional(),
});

const uniqueFieldBodySchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  mobile: z.string().min(1).nullable().optional(),
});

const verificationBodySchema = z.object({
  isEmailVerified: z.boolean().nullable().optional(),
  isMobileVerified: z.boolean().nullable().optional(),
});

const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  mobile: z.string().nullable(),
});

const companyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});

const companyUsersResponseSchema = z.object({
  company: companyResponseSchema,
  users: z.array(userResponseSchema),
});

const allUsersResponseSchema = z.array(companyUsersResponseSchema);

const tags = ["User"];

export const getAllUsersSchema = buildSchema({
  tags,
  response: { 200: buildSuccessResponseSchema(allUsersResponseSchema) },
});

export const getCompanyUsersSchema = buildSchema({
  tags,
  response: { 200: buildSuccessResponseSchema(companyUsersResponseSchema) },
});

export const getUserByIdSchema = buildSchema({
  tags,
  params: idParamsSchema,
  response: { 200: buildSuccessResponseSchema(userResponseSchema) },
});

export const createCompanyUserSchema = buildSchema({
  tags,
  body: createUserBodySchema,
  response: { 200: buildSuccessResponseSchema(userResponseSchema) },
});

export const createCompanyAdminUserSchema = buildSchema({
  tags,
  body: createCompanyAdminUserBodySchema,
  response: { 201: buildSuccessResponseSchema(userResponseSchema) },
});

export const updateUserSchema = buildSchema({
  tags,
  params: idParamsSchema,
  body: updateUserBodySchema,
  response: { 200: buildSuccessResponseSchema(userResponseSchema) },
});

export const updateUniqueFieldSchema = buildSchema({
  tags,
  params: idParamsSchema,
  body: uniqueFieldBodySchema,
  response: { 200: buildSuccessResponseSchema(userResponseSchema) },
});

export const updateVerificationStatusSchema = buildSchema({
  tags,
  params: idParamsSchema,
  body: verificationBodySchema,
  response: { 200: buildSuccessResponseSchema(userResponseSchema) },
});

export const deleteUserSchema = buildSchema({
  tags,
  params: idParamsSchema,
});
