import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "@service";
import { BaseController } from "@controller";
import {
  ICreateCompanyAdminUserPayload,
  ICreateUserPayload,
  IIdParams,
  IPaginationQuery,
  IUniqueUserFields,
  IUpdateUserPayload,
  IUpdateVerificationStatusPayload,
} from "@type";

/**
 * UserController handles HTTP request/response operations for user management endpoints.
 * @class UserController
 */
export class UserController extends BaseController {
  private readonly userService: UserService;

  constructor() {
    super("UserController");
    this.userService = new UserService();
  }

  async getAllUsers(
    request: FastifyRequest<{ Querystring: IPaginationQuery }>,
    reply: FastifyReply,
  ) {
    await this.controllerAction(async () => {
      const data = await this.userService.getAllUsers(request.query);
      return this.success(reply, data);
    }, request, reply);
  }

  async getCompanyUsers(
    request: FastifyRequest<{ Params: { companyId: string }; Querystring: IPaginationQuery }>,
    reply: FastifyReply,
  ) {
    const { companyId } = request.params;

    await this.controllerAction(async () => {
      const data = await this.userService.getCompanyUsers(companyId, request.query);
      return this.success(reply, data);
    }, request, reply);
  }

  async getById(request: FastifyRequest<{ Params: IIdParams }>, reply: FastifyReply) {
    const { id } = request.params;
    await this.controllerAction(async () => {
      const user = await this.userService.getById(id);
      return this.success(reply, user);
    }, request, reply);
  }

  async createCompanyUser(
    request: FastifyRequest<{ Params: { companyId: string }; Body: ICreateUserPayload }>,
    reply: FastifyReply,
  ) {
    const { companyId } = request.params;
    await this.controllerAction(async () => {
      const user = await this.userService.createCompanyUser(request.body, companyId);
      return this.success(reply, user);
    }, request, reply);
  }

  async createCompanyAdminUser(
    request: FastifyRequest<{ Body: ICreateCompanyAdminUserPayload }>,
    reply: FastifyReply,
  ) {
    await this.controllerAction(async () => {
      const user = await this.userService.createCompanyAdminUser(request.body);
      return this.created(reply, user);
    }, request, reply);
  }

  async updateUniqueField(
    request: FastifyRequest<{ Params: IIdParams; Body: IUniqueUserFields }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    await this.controllerAction(async () => {
      const user = await this.userService.updateUniqueField(id, request.body);
      return this.success(reply, user);
    }, request, reply);
  }

  async updateVerificationStatus(
    request: FastifyRequest<{ Params: IIdParams; Body: IUpdateVerificationStatusPayload }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    await this.controllerAction(async () => {
      const user = await this.userService.updateVerificationStatus(id, request.body);
      return this.success(reply, user);
    }, request, reply);
  }

  async updateUser(
    request: FastifyRequest<{ Params: IIdParams; Body: IUpdateUserPayload }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    await this.controllerAction(async () => {
      const user = await this.userService.updateUser(id, request.body);
      return this.success(reply, user);
    }, request, reply);
  }

  async deleteUser(request: FastifyRequest<{ Params: IIdParams }>, reply: FastifyReply) {
    const { id } = request.params;
    await this.controllerAction(async () => {
      const deletedBy = "system";
      await this.userService.deleteUser(id, deletedBy);
      return this.noContent(reply);
    }, request, reply);
  }
}

export const userController = new UserController();
