import { JSONSchema7 } from "json-schema";
import { buildSchema, idParams } from "@schema";

/* ---------------- PARAMS ---------------- */

const companyParams: JSONSchema7 = {
  type: "object",
  required: ["companyId"],
  properties: {
    companyId: { type: "string", format: "uuid" },
  },
};

/* ---------------- BODY ---------------- */

const createUserBody: JSONSchema7 = {
  type: "object",
  required: ["username", "password", "firstName", "lastName"],
  properties: {
    username: { type: "string" },
    password: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string", format: "email" },
    mobile: { type: "string" },
  },
};

const createCompanyAdminUserBody: JSONSchema7 = {
  type: "object",
  required: ["company", "user"],
  properties: {
    company: { type: "object" },
    user: { type: "object" },
  },
};

const updateUserBody: JSONSchema7 = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    isActive: { type: "boolean" },
    addressId: { type: "string", format: "uuid" },
    profileAssetId: { type: "string", format: "uuid" },
  },
};

const uniqueFieldBody: JSONSchema7 = {
  type: "object",
  properties: {
    username: { type: "string" },
    email: { type: "string", format: "email" },
    mobile: { type: "string" },
  },
};

const verificationBody: JSONSchema7 = {
  type: "object",
  properties: {
    isEmailVerified: { type: "boolean" },
    isMobileVerified: { type: "boolean" },
  },
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
};

const companyResponse: JSONSchema7 = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    isActive: { type: "boolean" },
  },
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
};

const allUsersResponse: JSONSchema7 = {
  type: "array",
  items: companyUsers,
};

const tags = ["User"];

/* ---------------- EXPORTS ---------------- */

export const getAllUsersSchema = buildSchema({
  tags,
  response: { 200: allUsersResponse },
});

export const getCompanyUsersSchema = buildSchema({
  tags,
  params: companyParams,
  response: { 200: companyUsers },
});

export const getUserByIdSchema = buildSchema({
  tags,
  params: idParams,
  response: { 200: userResponse },
});

export const createCompanyUserSchema = buildSchema({
  tags,
  body: createUserBody,
  response: { 200: userResponse },
});

export const createCompanyAdminUserSchema = buildSchema({
  tags,
  body: createCompanyAdminUserBody,
  response: { 200: userResponse },
});

export const updateUserSchema = buildSchema({
  tags,
  params: idParams,
  body: updateUserBody,
  response: { 200: userResponse },
});

export const updateUniqueFieldSchema = buildSchema({
  tags,
  params: idParams,
  body: uniqueFieldBody,
  response: { 200: userResponse },
});

export const updateVerificationStatusSchema = buildSchema({
  tags,
  params: idParams,
  body: verificationBody,
  response: { 200: userResponse },
});

export const deleteUserSchema = buildSchema({
  tags,
  params: idParams,
});
