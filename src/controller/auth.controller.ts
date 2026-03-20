import { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "@controller";
import { authService } from "@service";
import { ILoginRoute } from "@type";

export class AuthController extends BaseController {
  async login(request: FastifyRequest<ILoginRoute>, reply: FastifyReply) {
    const token = await authService.login(request.body);
    return this.success(reply, token, "Login successful");
  }
}

export const authController = new AuthController();
