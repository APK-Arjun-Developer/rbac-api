import { FastifyReply, FastifyRequest } from "fastify";
import { UserService, NotFoundError } from "@service";
import { BaseController } from "@controller";
import {
  ICreateCompanyAdminUserRoute,
  ICreateCompanyUserRoute,
  IGetUserByIdRoute,
  IUpdateUniqueFieldRoute,
  IUpdateUserRoute,
  IUpdateVerificationStatusRoute,
} from "@type";

export class UserController extends BaseController {
  private readonly userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  async getAllUsers(_request: FastifyRequest, reply: FastifyReply) {
    const data = await this.userService.getAllUsers();
    return this.success(reply, data);
  }

  async getCompanyUsers(request: FastifyRequest, reply: FastifyReply) {
    const companyId = request.authUser.companyId;

    if (!companyId) {
      throw new NotFoundError("Company not found for user");
    }

    const data = await this.userService.getCompanyUsers(companyId);
    return this.success(reply, data);
  }

  async getById(request: FastifyRequest<IGetUserByIdRoute>, reply: FastifyReply) {
    const { id } = request.params;
    const user = await this.userService.getById(id);
    return this.success(reply, user);
  }

  async createCompanyUser(request: FastifyRequest<ICreateCompanyUserRoute>, reply: FastifyReply) {
    const companyId = request.authUser.companyId;

    if (!companyId) {
      throw new NotFoundError("Company not found for user");
    }

    const user = await this.userService.createCompanyUser(request.body, companyId);
    return this.success(reply, user);
  }

  async createCompanyAdminUser(
    request: FastifyRequest<ICreateCompanyAdminUserRoute>,
    reply: FastifyReply,
  ) {
    const user = await this.userService.createCompanyAdminUser(request.body);
    return this.created(reply, user);
  }

  async updateUniqueField(request: FastifyRequest<IUpdateUniqueFieldRoute>, reply: FastifyReply) {
    const { id } = request.params;
    const user = await this.userService.updateUniqueField(id, request.body);
    return this.success(reply, user);
  }

  async updateVerificationStatus(
    request: FastifyRequest<IUpdateVerificationStatusRoute>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const user = await this.userService.updateVerificationStatus(id, request.body);
    return this.success(reply, user);
  }

  async updateUser(request: FastifyRequest<IUpdateUserRoute>, reply: FastifyReply) {
    const { id } = request.params;
    const user = await this.userService.updateUser(id, request.body);
    return this.success(reply, user);
  }

  async deleteUser(request: FastifyRequest<IGetUserByIdRoute>, reply: FastifyReply) {
    const { id } = request.params;
    const deletedBy = request.authUser.userId ?? "system";
    await this.userService.deleteUser(id, deletedBy);
    return this.noContent(reply);
  }
}

export const userController = new UserController();
