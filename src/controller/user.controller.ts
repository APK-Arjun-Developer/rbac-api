import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "@service";
import { BaseController } from "@controller";
import {
  ICreateCompanyAdminUserPayload,
  ICreateUserPayload,
  IIdParams,
  IUniqueUserFields,
  IUpdateUserPayload,
  IUpdateVerificationStatusPayload,
} from "@type";
import { NotFoundError } from "@service";

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
    const companyId = request.authUser?.companyIds[0];

    if (!companyId) {
      throw new NotFoundError("Company not found for user");
    }

    const data = await this.userService.getCompanyUsers(companyId);
    return this.success(reply, data);
  }

  async getById(request: FastifyRequest<{ Params: IIdParams }>, reply: FastifyReply) {
    const { id } = request.params;
    const user = await this.userService.getById(id);
    return this.success(reply, user);
  }

  async createCompanyUser(
    request: FastifyRequest<{ Body: ICreateUserPayload }>,
    reply: FastifyReply,
  ) {
    const companyId = request.authUser?.companyIds[0];

    if (!companyId) {
      throw new NotFoundError("Company not found for user");
    }

    const user = await this.userService.createCompanyUser(request.body, companyId);
    return this.success(reply, user);
  }

  async createCompanyAdminUser(
    request: FastifyRequest<{ Body: ICreateCompanyAdminUserPayload }>,
    reply: FastifyReply,
  ) {
    const user = await this.userService.createCompanyAdminUser(request.body);
    return this.created(reply, user);
  }

  async updateUniqueField(
    request: FastifyRequest<{ Params: IIdParams; Body: IUniqueUserFields }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const user = await this.userService.updateUniqueField(id, request.body);
    return this.success(reply, user);
  }

  async updateVerificationStatus(
    request: FastifyRequest<{ Params: IIdParams; Body: IUpdateVerificationStatusPayload }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const user = await this.userService.updateVerificationStatus(id, request.body);
    return this.success(reply, user);
  }

  async updateUser(
    request: FastifyRequest<{ Params: IIdParams; Body: IUpdateUserPayload }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const user = await this.userService.updateUser(id, request.body);
    return this.success(reply, user);
  }

  async deleteUser(request: FastifyRequest<{ Params: IIdParams }>, reply: FastifyReply) {
    const { id } = request.params;
    const deletedBy = request.authUser?.userId ?? "system";
    await this.userService.deleteUser(id, deletedBy);
    return this.noContent(reply);
  }
}

export const userController = new UserController();
