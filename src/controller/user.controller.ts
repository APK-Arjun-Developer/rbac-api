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

export class UserController extends BaseController {
  private readonly userService: UserService;

  constructor() {
    super("UserController");
    this.userService = new UserService();
  }

  async getAllUsers(_request: FastifyRequest, reply: FastifyReply) {
    return this.controllerAction(async (_req, res) => {
      const data = await this.userService.getAllUsers();
      return this.success(res, data);
    })(_request, reply);
  }

  async getCompanyUsers(_request: FastifyRequest, reply: FastifyReply) {
    const companyId = "temp-company-id";

    return this.controllerAction(async (_req, res) => {
      const data = await this.userService.getCompanyUsers(companyId);
      return this.success(res, data);
    })(_request, reply);
  }

  async getById(request: FastifyRequest<{ Params: IIdParams }>, reply: FastifyReply) {
    return this.controllerAction(async (req, res) => {
      const { id } = (req as FastifyRequest<{ Params: IIdParams }>).params;
      const user = await this.userService.getById(id);
      return this.success(res, user);
    })(request, reply);
  }

  async createCompanyUser(
    request: FastifyRequest<{ Body: ICreateUserPayload }>,
    reply: FastifyReply,
  ) {
    const companyId = "temp-company-id";

    return this.controllerAction(async (req, res) => {
      const body = (req as FastifyRequest<{ Body: ICreateUserPayload }>).body;
      const user = await this.userService.createCompanyUser(body, companyId);
      return this.success(res, user);
    })(request, reply);
  }

  async createCompanyAdminUser(
    request: FastifyRequest<{ Body: ICreateCompanyAdminUserPayload }>,
    reply: FastifyReply,
  ) {
    return this.controllerAction(async (req, res) => {
      const body = (req as FastifyRequest<{ Body: ICreateCompanyAdminUserPayload }>).body;
      const user = await this.userService.createCompanyAdminUser(body);
      return this.created(res, user);
    })(request, reply);
  }

  async updateUniqueField(
    request: FastifyRequest<{ Params: IIdParams; Body: IUniqueUserFields }>,
    reply: FastifyReply,
  ) {
    return this.controllerAction(async (req, res) => {
      const { id } = (req as FastifyRequest<{ Params: IIdParams }>).params;
      const body = (req as FastifyRequest<{ Body: IUniqueUserFields }>).body;
      const user = await this.userService.updateUniqueField(id, body);
      return this.success(res, user);
    })(request, reply);
  }

  async updateVerificationStatus(
    request: FastifyRequest<{ Params: IIdParams; Body: IUpdateVerificationStatusPayload }>,
    reply: FastifyReply,
  ) {
    return this.controllerAction(async (req, res) => {
      const { id } = (req as FastifyRequest<{ Params: IIdParams }>).params;
      const body = (req as FastifyRequest<{ Body: IUpdateVerificationStatusPayload }>).body;
      const user = await this.userService.updateVerificationStatus(id, body);
      return this.success(res, user);
    })(request, reply);
  }

  async updateUser(
    request: FastifyRequest<{ Params: IIdParams; Body: IUpdateUserPayload }>,
    reply: FastifyReply,
  ) {
    return this.controllerAction(async (req, res) => {
      const { id } = (req as FastifyRequest<{ Params: IIdParams }>).params;
      const body = (req as FastifyRequest<{ Body: IUpdateUserPayload }>).body;
      const user = await this.userService.updateUser(id, body);
      return this.success(res, user);
    })(request, reply);
  }

  async deleteUser(request: FastifyRequest<{ Params: IIdParams }>, reply: FastifyReply) {
    return this.controllerAction(async (req, res) => {
      const { id } = (req as FastifyRequest<{ Params: IIdParams }>).params;
      const deletedBy = "system";
      await this.userService.deleteUser(id, deletedBy);
      return this.noContent(res);
    })(request, reply);
  }
}

export const userController = new UserController();
