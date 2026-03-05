import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

/**
 * Authentication Middleware
 * Expected Authorization header format: "Bearer <jwt_token>"
 * @async
 * @param {FastifyRequest} req - Fastify request object
 * @param {FastifyReply} res - Fastify reply object
 * @returns {Promise<void>} Returns early with 401 if auth fails, continues otherwise
 * @throws {401} If Authorization header is missing or token is invalid
 */
export async function authMiddleware(req: FastifyRequest, res: FastifyReply) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send({ message: "Unauthorized" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    (req as any).user = decoded;
  } catch {
    return res.status(401).send({ message: "Invalid token" });
  }
}
