import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export async function authMiddleware(req: FastifyRequest, res: FastifyReply) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send({ message: "Unauthorized" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    (req as any).user = decoded;
  } catch {
    return res.status(401).send({ message: "Invalid token" });
  }
}
