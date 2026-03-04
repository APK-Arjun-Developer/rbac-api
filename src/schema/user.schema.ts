import { JSONSchema7 } from "json-schema";
import { buildSchema } from "./common.schema";

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

/* ---------------- BODY ---------------- */

const createUserBody: JSONSchema7 = {
  type: "object",
  required: ["username", "password", "firstName", "lastName", "addressId"],
  properties: {
    username: { type: "string", minLength: 3 },
    password: { type: "string", minLength: 6 },
    firstName: { type: "string", minLength: 1 },
    lastName: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
    mobile: { type: "string", minLength: 10 },
    addressId: { type: "string", format: "uuid" },
  },
  additionalProperties: false,
};

const updateUserBody: JSONSchema7 = {
  type: "object",
  properties: {
    username: { type: "string", minLength: 3 },
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string", format: "email" },
    mobile: { type: "string" },
    isActive: { type: "boolean" },
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

const allUsersResponse: JSONSchema7 = {
  type: "array",
  items: companyUsers,
};

/* ---------------- EXPORTS ---------------- */

export const getAllUsersSchema = buildSchema({
  response200: allUsersResponse,
});

export const getCompanyUsersSchema = buildSchema({
  params: companyParams,
  response200: companyUsers,
});

export const getUserByIdSchema = buildSchema({
  params: idParams,
  response200: userResponse,
});

export const createCompanyUserSchema = buildSchema({
  params: companyParams,
  body: createUserBody,
  response200: userResponse,
});

export const updateUserSchema = buildSchema({
  params: idParams,
  body: updateUserBody,
  response200: userResponse,
});

export const deleteUserSchema = buildSchema({
  params: idParams,
});
