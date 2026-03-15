import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "@service";

/**
 * UserController handles HTTP request/response operations for user management endpoints.
 * @class UserController
 */
export class UserController {
  private readonly userService: UserService;

  constructor() {
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
    const data = await this.userService.getAllUsers();
    return reply.send(data);
  }

  /**
   * Retrieves all users belonging to a specific company.
   * @async
   * @param {FastifyRequest<{ Params: { companyId: string } }>} request - Fastify request with companyId parameter
   * @param {string} request.params.companyId - The unique identifier of the company
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 200 response with company and users data
   */
  async getCompanyUsers(
    request: FastifyRequest<{ Params: { companyId: string } }>,
    reply: FastifyReply,
  ) {
    const { companyId } = request.params;
    const data = await this.userService.getCompanyUsers(companyId);
    return reply.send(data);
  }

  /**
   * Retrieves a single user by their unique identifier.
   * @async
   * @param {FastifyRequest<{ Params: { id: string } }>} request - Fastify request with user id parameter
   * @param {string} request.params.id - The unique identifier of the user to retrieve
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 200 response with user data
   */
  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const user = await this.userService.getById(id);
    return reply.send(user);
  }

  /**
   * Creates a new company user with validation.
   * @async
   * @param {FastifyRequest<{ Params: { companyId: string } }>} request - Fastify request with companyId param and user data in body
   * @param {string} request.params.companyId - The company to associate the new user with
   * @param {Object} request.body - User creation data (email, username, password, mobile, etc.)
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 201 response with newly created user data
   */
  async createCompanyUser(
    request: FastifyRequest<{ Params: { companyId: string } }>,
    reply: FastifyReply,
  ) {
    const { companyId } = request.params;

    const user = await this.userService.createCompanyUser(request.body as any, companyId);

    return reply.code(201).send(user);
  }

  /**
   * Updates user information (profile, contact details, etc.).
   * @async
   * @param {FastifyRequest<{ Params: { id: string } }>} request - Fastify request with user id and update data in body
   * @param {string} request.params.id - The unique identifier of the user to update
   * @param {Object} request.body - Partial user data to update the record with
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 200 response with updated user data
   */
  async updateUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    const user = await this.userService.updateUser(id, request.body as any);

    return reply.send(user);
  }

  /**
   * Soft deletes a user from the system.
   * @async
   * @param {FastifyRequest<{ Params: { id: string } }>} request - Fastify request with user id parameter
   * @param {string} request.params.id - The unique identifier of the user to delete
   * @param {FastifyReply} reply - Fastify reply object for sending response
   * @returns {Promise<FastifyReply>} HTTP 204 No Content response on successful deletion
   */
  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    // Ideally get from auth middleware
    const deletedBy = "system";

    await this.userService.deleteUser(id, deletedBy);

    return reply.code(204).send();
  }
}

export const userController = new UserController();
