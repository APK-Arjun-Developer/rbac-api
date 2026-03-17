import { JSONSchema7 } from "json-schema";
import { buildSchema } from "@schema";

/* ---------------- PARAMS ---------------- */

const idParams: JSONSchema7 = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
};

const companyParams: JSONSchema7 = {
  type: "object",
  required: ["companyId"],
  properties: {
    companyId: { type: "string", format: "uuid" },
  },
};

const paginationQuery: JSONSchema7 = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1 },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
  additionalProperties: false,
};

/* ---------------- BODY ---------------- */

const addressBody: JSONSchema7 = {
  type: "object",
  required: ["addressLine1", "city", "district", "state", "pincode"],
  properties: {
    addressLine1: { type: "string", minLength: 1 },
    addressLine2: { type: ["string", "null"] },
    city: { type: "string", minLength: 1 },
    district: { type: "string", minLength: 1 },
    state: { type: "string", minLength: 1 },
    pincode: { type: "string", minLength: 4 },
  },
  additionalProperties: false,
};

const assetBody: JSONSchema7 = {
  type: "object",
  required: ["originalName", "uploadedName", "fileFormat", "storageType", "relativePath"],
  properties: {
    originalName: { type: "string" },
    uploadedName: { type: "string" },
    fileFormat: { type: "string" },
    storageType: { type: "string", enum: ["LOCAL"] },
    relativePath: { type: "string" },
  },
  additionalProperties: false,
};

const createUserBody: JSONSchema7 = {
  type: "object",
  required: ["username", "password", "firstName", "lastName", "address"],
  properties: {
    username: { type: "string", minLength: 3 },
    password: { type: "string", minLength: 6 },
    firstName: { type: "string", minLength: 1 },
    lastName: { type: "string", minLength: 1 },
    email: { type: ["string", "null"], format: "email" },
    mobile: { type: ["string", "null"], minLength: 10 },
    address: addressBody,
    profileAsset: { anyOf: [assetBody, { type: "null" }] },
  },
  additionalProperties: false,
};

const roleBody: JSONSchema7 = {
  type: "object",
  required: ["name", "permissionIds"],
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: ["string", "null"] },
    permissionIds: {
      type: "array",
      items: { type: "string", format: "uuid" },
    },
  },
  additionalProperties: false,
};

const createCompanyAdminBody: JSONSchema7 = {
  type: "object",
  required: ["company", "user", "roles"],
  properties: {
    company: {
      type: "object",
      required: ["name", "address", "roles"],
      properties: {
        name: { type: "string", minLength: 1 },
        address: addressBody,
        profileAsset: { anyOf: [assetBody, { type: "null" }] },
        roles: {
          type: "array",
          items: roleBody,
        },
      },
      additionalProperties: false,
    },
    user: createUserBody,
    roles: {
      type: "array",
      items: roleBody,
    },
  },
  additionalProperties: false,
};

const updateUserBody: JSONSchema7 = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    isActive: { type: "boolean" },
    addressId: { type: "string", format: "uuid" },
    profileAssetId: { type: ["string", "null"], format: "uuid" },
  },
  additionalProperties: false,
};

const updateUniqueBody: JSONSchema7 = {
  type: "object",
  properties: {
    username: { type: "string", minLength: 3 },
    email: { type: ["string", "null"], format: "email" },
    mobile: { type: ["string", "null"], minLength: 10 },
  },
  additionalProperties: false,
};

const updateVerificationBody: JSONSchema7 = {
  type: "object",
  properties: {
    isEmailVerified: { type: ["boolean", "null"] },
    isMobileVerified: { type: ["boolean", "null"] },
  },
  additionalProperties: false,
};

/* ---------------- RESPONSE ---------------- */

const userResponse: JSONSchema7 = {
  type: "object",
  properties: {
    id: { type: "string" },
    username: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string" },
    mobile: { type: "string" },
  },
  required: ["id", "username", "firstName", "lastName"],
};

const companyResponse: JSONSchema7 = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    isActive: { type: "boolean" },
  },
  required: ["id", "name", "isActive"],
};

const companyUsers: JSONSchema7 = {
  type: "object",
  properties: {
    company: companyResponse,
    users: {
      type: "array",
      items: userResponse,
    },
  },
  required: ["company", "users"],
};

const paginatedCompanyUsersResponse: JSONSchema7 = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: companyUsers,
    },
    page: { type: "number" },
    limit: { type: "number" },
    total: { type: "number" },
  },
  required: ["items", "page", "limit", "total"],
};

const paginatedUsersResponse: JSONSchema7 = {
  type: "object",
  properties: {
    company: companyResponse,
    users: {
      type: "array",
      items: userResponse,
    },
    page: { type: "number" },
    limit: { type: "number" },
    total: { type: "number" },
  },
  required: ["company", "users", "page", "limit", "total"],
};

const tags = ["User"];

/* ---------------- EXPORTS ---------------- */

export const getAllUsersSchema = buildSchema({
  tags,
  querystring: paginationQuery,
  response200: paginatedCompanyUsersResponse,
});

export const getCompanyUsersSchema = buildSchema({
  tags,
  params: companyParams,
  querystring: paginationQuery,
  response200: paginatedUsersResponse,
});

export const getUserByIdSchema = buildSchema({
  tags,
  params: idParams,
  response200: userResponse,
});

export const createCompanyUserSchema = buildSchema({
  tags,
  params: companyParams,
  body: createUserBody,
  response200: userResponse,
});

export const createCompanyAdminSchema = buildSchema({
  tags,
  body: createCompanyAdminBody,
  response200: userResponse,
});

export const updateUserSchema = buildSchema({
  tags,
  params: idParams,
  body: updateUserBody,
  response200: userResponse,
});

export const updateUniqueFieldSchema = buildSchema({
  tags,
  params: idParams,
  body: updateUniqueBody,
  response200: userResponse,
});

export const updateVerificationStatusSchema = buildSchema({
  tags,
  params: idParams,
  body: updateVerificationBody,
  response200: userResponse,
});

export const deleteUserSchema = buildSchema({
  tags,
  params: idParams,
});
