import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "../service/user.service";

export class UserController {
  async getAllUsers(_request: FastifyRequest, reply: FastifyReply) {
    const data = await userService.getAllUsers();
    return reply.send(data);
  }

  async getCompanyUsers(
    request: FastifyRequest<{ Params: { companyId: string } }>,
    reply: FastifyReply,
  ) {
    const { companyId } = request.params;
    const data = await userService.getCompanyUsers(companyId);
    return reply.send(data);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const user = await userService.getById(id);
    return reply.send(user);
  }

  async createCompanyUser(
    request: FastifyRequest<{ Params: { companyId: string } }>,
    reply: FastifyReply,
  ) {
    const { companyId } = request.params;

    const user = await userService.createCompanyUser(request.body as any, companyId);

    return reply.code(201).send(user);
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    const user = await userService.updateUser(id, request.body as any);

    return reply.send(user);
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    // Ideally get from auth middleware
    const deletedBy = "system";

    await userService.deleteUser(id, deletedBy);

    return reply.code(204).send();
  }
}

export const userController = new UserController();
