export const createCompanyUserSchema = {
  params: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string", format: "uuid" },
    },
  },
  body: {
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
  },
};

export const updateUserSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
  body: {
    type: "object",
    additionalProperties: false,
    properties: {
      username: { type: "string", minLength: 3 },
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string", format: "email" },
      mobile: { type: "string" },
      isActive: { type: "boolean" },
    },
  },
};

export const idParamSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
};

export const companyParamSchema = {
  params: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string", format: "uuid" },
    },
  },
};
