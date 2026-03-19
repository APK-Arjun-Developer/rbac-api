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
  /**
   * Retrieves all users grouped by their associated companies.
   * @async
   * @param {FastifyRequest} _request - Fastify request object (not used for this endpoint)
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 200 response with array of companies and their users
   */
  async getAllUsers(_request: FastifyRequest, reply: FastifyReply) {
    this.controllerAction(async () => {
      const data = await this.userService.getAllUsers();
      return this.success(reply, data);
    });
  }

  /**
   * Retrieves all users belonging to a specific company.
   * @async
   * @param {FastifyRequest} _request - Fastify request with companyId parameter
   * @param {string} request.params.companyId - The unique identifier of the company
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 200 response with company and users data
   */
  async getCompanyUsers(_request: FastifyRequest, reply: FastifyReply) {
    const companyId = "temp-company-id"; // Placeholder until auth middleware provides companyId
    this.controllerAction(async () => {
      const data = await this.userService.getCompanyUsers(companyId);
      return this.success(reply, data);
    });
  }

  /**
   * Retrieves a single user by their unique identifier.
   * @async
   * @param {FastifyRequest<{ Params: IIdParams }>} request - Fastify request with user id parameter
   * @param {string} request.params.id - The unique identifier of the user to retrieve
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 200 response with user data
   */
  async getById(request: FastifyRequest<{ Params: IIdParams }>, reply: FastifyReply) {
    const { id } = request.params;
    this.controllerAction(async () => {
      const user = await this.userService.getById(id);
      return this.success(reply, user);
    });
  }

  /**
   * Creates a new company user with validation.
   * @async
   * @param {FastifyRequest} request - Fastify request with companyId param and user data in body
   * @param {Object} request.body - User creation data (email, username, password, mobile, etc.)
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 201 response with newly created user data
   */
  async createCompanyUser(
    request: FastifyRequest<{ Body: ICreateUserPayload }>,
    reply: FastifyReply,
  ) {
    const companyId = "temp-company-id"; // Placeholder until auth middleware provides companyId
    this.controllerAction(async () => {
      const user = await this.userService.createCompanyUser(request.body, companyId);
      return this.success(reply, user);
    });
  }

  /**
   * Creates a new company along with its admin user.
   * @async
   * @param {FastifyRequest} request - Fastify request containing company and admin user data in body
   * @param {FastifyReply} reply - Fastify reply object
   * @returns {Promise<FastifyReply>} HTTP 201 response with created admin user
   */
  async createCompanyAdminUser(
    request: FastifyRequest<{ Body: ICreateCompanyAdminUserPayload }>,
    reply: FastifyReply,
  ) {
    this.controllerAction(async () => {
      const user = await this.userService.createCompanyAdminUser(request.body);
      return this.created(reply, user);
    });
  }

  /**
   * Updates unique user fields such as username, email, or mobile.
   * @async
   * @param {FastifyRequest<{ Params: IIdParams }>} request
   * @param {FastifyReply} reply
   */
  async updateUniqueField(
    request: FastifyRequest<{ Params: IIdParams; Body: IUniqueUserFields }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    this.controllerAction(async () => {
      const user = await this.userService.updateUniqueField(id, request.body);
      return this.success(reply, user);
    });
  }

  /**
   * Updates email/mobile verification status for a user.
   * @async
   * @param {FastifyRequest<{ Params: IIdParams }>} request
   * @param {FastifyReply} reply
   */
  async updateVerificationStatus(
    request: FastifyRequest<{ Params: IIdParams; Body: IUpdateVerificationStatusPayload }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    this.controllerAction(async () => {
      const user = await this.userService.updateVerificationStatus(id, request.body);
      return this.success(reply, user);
    });
  }

  /**
   * Updates user information (profile, contact details, etc.).
   * @async
   * @param {FastifyRequest<{ Params: IIdParams }>} request - Fastify request with user id and update data in body
   * @param {string} request.params.id - The unique identifier of the user to update
   * @param {Object} request.body - Partial user data to update the record with
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 200 response with updated user data
   */
  async updateUser(
    request: FastifyRequest<{ Params: IIdParams; Body: IUpdateUserPayload }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    this.controllerAction(async () => {
      const user = await this.userService.updateUser(id, request.body);
      return this.success(reply, user);
    });
  }

  /**
   * Soft deletes a user from the system.
   * @async
   * @param {FastifyRequest<{ Params: IIdParams }>} request - Fastify request with user id parameter
   * @param {string} request.params.id - The unique identifier of the user to delete
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 204 No Content response on successful deletion
   */
  async deleteUser(request: FastifyRequest<{ Params: IIdParams }>, reply: FastifyReply) {
    const { id } = request.params;
    this.controllerAction(async () => {
      // Ideally get from auth middleware
      const deletedBy = "system";
      await this.userService.deleteUser(id, deletedBy);
      return this.noContent(reply);
    });
  }
}

export const userController = new UserController();
