import dotenv from "dotenv";

dotenv.config();

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`❌ Environment validation failed: ${name} is required but not defined`);
  }

  return value;
}

function getNumber(name: string): number {
  const value = getEnv(name);
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`❌ Environment validation failed: ${name} must be a valid number`);
  }

  return parsed;
}

export const env = Object.freeze({
  // Application configuration
  NODE_ENV: getEnv("NODE_ENV"),
  PORT: getNumber("PORT"),
  HOST: getEnv("HOST"),
  SWAGGER_ROUTE: getEnv("SWAGGER_ROUTE"),
  SERVER_URL: `http://${getEnv("HOST")}:${getNumber("PORT")}`,
  SWAGGER_URL: `http://${getEnv("HOST")}:${getNumber("PORT")}/${getEnv("SWAGGER_ROUTE")}`,

  // Database configuration
  DATABASE_URL: getEnv("DATABASE_URL"),

  // Authentication configuration
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_ACCESS_EXPIRY: getEnv("JWT_ACCESS_EXPIRY"),
  JWT_REFRESH_EXPIRY: getEnv("JWT_REFRESH_EXPIRY"),
  SALT_ROUNDS: getNumber("SALT_ROUNDS"),
});
