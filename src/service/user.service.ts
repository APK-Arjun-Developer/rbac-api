import { Prisma, SystemRoleType } from "@prisma/client";
import {
  UserRepository,
  CompanyRepository,
  AddressRepository,
  AssetRepository,
  RoleRepository,
} from "@repository";
import { BaseService, ConflictError, NotFoundError } from "@service";
import { db } from "@config";
import {
  ICreateUserPayload,
  IUpdateUserPayload,
  IUniqueUserFields,
  ICreateCompanyAdminUserPayload,
} from "@type";

/**
 * UserService handles all business logic, validation, and rules for user management.
 */
export class UserService extends BaseService {
  private readonly userRepository: UserRepository;
  private readonly companyRepository: CompanyRepository;
  private readonly addressRepository: AddressRepository;
  private readonly assetRepository: AssetRepository;
  private readonly roleRepository: RoleRepository;

  constructor() {
    super(db, "UserService");
    this.userRepository = new UserRepository();
    this.companyRepository = new CompanyRepository();
    this.addressRepository = new AddressRepository();
    this.assetRepository = new AssetRepository();
    this.roleRepository = new RoleRepository();
  }
  /**
   * Retrieves all active users grouped by company.
   * @returns {Promise<Array>} Array of objects containing company info and associated users
   * @returns {Object} return[].company - Company information (id, name, isActive)
   * @returns {Array} return[].users - Array of User objects for that company
   */
  async getAllUsers() {
    const res = await this.transaction(async (tx) => {
      const companies = await this.userRepository.getAllUsersGroupedByCompany(tx);

      // transform into schema-defined shape: { company: {id,name,isActive}, users: User[] }
      return companies.map((company) => {
        const users = company.userCompanies
          .filter((uc) => uc.user.systemRole === SystemRoleType.COMPANY_USER)
          .map((uc) => uc.user);

        return {
          company: {
            id: company.id,
            name: company.name,
            isActive: company.isActive,
          },
          users,
        };
      });
    });

    return res;
  }

  /**
   * Retrieves all active users belonging to a specific company.
   * @param {string} companyId - The unique identifier of the company
   * @returns {Promise<Object>} Object containing company information and user array
   * @returns {Object} return.company - Company details (id, name, isActive) or null if not found
   * @returns {Array<User>} return.users - Array of users associated with the company
   */
  async getCompanyUsers(companyId: string) {
    const res = await this.transaction(async (tx) => {
      return this.userRepository.getCompanyUsers(tx, companyId);
    });

    return res;
  }

  /**
   * Retrieves a single user by their unique identifier.
   * @param {string} id - The unique identifier of the user to retrieve
   * @returns {Promise<User>} The user object with all associated data
   */
  async getById(id: string) {
    const res = await this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new NotFoundError("User not found");
      return user;
    });

    return res;
  }

  /**
   * Creates a new company user with validation of unique fields.
   * @param {ICreateUserPayload} data - User creation data (email, username, password, mobile, etc.)
   * @param {string} companyId - ID of the company the user should be linked to
   * @returns {Promise<User>} The newly created user object
   */
  async createCompanyUser(data: ICreateUserPayload, companyId: string) {
    const res = await this.transaction(async (tx) => {
      await this.ensureUniqueFields(tx, {
        username: data.username,
        email: data.email,
        mobile: data.mobile,
      });

      const address = await this.addressRepository.create(tx, data.address);
      let profileAsset = null;
      if (data.profileAsset) {
        profileAsset = await this.assetRepository.create(tx, data.profileAsset);
      }

      const userPayload: Prisma.UserCreateInput = {
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        userCompanies: { create: { companyId } },
        address: { connect: { id: address.id } },
        ...(profileAsset && {
          profileAsset: { connect: { id: profileAsset.id } },
        }),
      };

      // delegate actual creation to the repository, which keeps database logic
      return this.userRepository.create(tx, userPayload);
    });

    return res;
  }

  /**
   * Creates a new company admin user with validation of unique fields.
   * @param {ICreateUserPayload} data - User creation data (email, username, password, mobile, etc.)
   * @param {string} companyId - ID of the company the user should be linked to
   * @returns {Promise<User>} The newly created user object
   */
  async createCompanyAdminUser(data: ICreateCompanyAdminUserPayload) {
    const res = await this.transaction(async (tx) => {
      const { company, user } = data;

      await this.ensureUniqueFields(tx, {
        username: user.username,
        email: user.email,
        mobile: user.mobile,
      });

      const companyAddress = await this.addressRepository.create(tx, company.address);
      let companyProfileAsset = null;
      if (company.profileAsset) {
        companyProfileAsset = await this.assetRepository.create(tx, company.profileAsset);
      }

      const newCompany = await this.companyRepository.create(tx, {
        name: company.name,
        address: { connect: { id: companyAddress.id } },
        ...(companyProfileAsset && {
          profileAsset: { connect: { id: companyProfileAsset.id } },
        }),
      });

      const rolesPayload: Prisma.RoleCreateManyInput[] = company.roles.map((r) => ({
        companyId: newCompany.id,
        name: r.name,
        description: r.description,
        rolePermissions: { create: r.permissionIds.map((id) => ({ permissionId: id })) },
      }));

      await this.roleRepository.createMany(tx, rolesPayload);

      const userAddress = await this.addressRepository.create(tx, user.address);
      let userProfileAsset = null;
      if (user.profileAsset) {
        userProfileAsset = await this.assetRepository.create(tx, user.profileAsset);
      }

      const userPayload: Prisma.UserCreateInput = {
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        systemRole: SystemRoleType.COMPANY_ADMIN,
        userCompanies: { create: { companyId: newCompany.id } },
        address: { connect: { id: userAddress.id } },
        ...(userProfileAsset && {
          profileAsset: { connect: { id: userProfileAsset.id } },
        }),
      };

      // delegate actual creation to the repository, which keeps database logic
      return this.userRepository.create(tx, userPayload);
    });

    return res;
  }

  /**
   * Updates user information (profile, contact details, etc.).
   * Password updates are NOT allowed through this method for security purposes.
   * Validates uniqueness of email, username, and mobile if being updated.
   *
   * @param {string} id - The unique identifier of the user to update
   * @param {IUpdateUserPayload} data - The fields to update (must not include password)
   * @returns {Promise<User>} The updated user object
   *
   * @throws {NotFoundError} Throws if user not found
   */
  async updateUser(id: string, data: IUpdateUserPayload) {
    const res = await this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new NotFoundError("User not found");
      const payload: Prisma.UserUpdateInput = {
        firstName: data.firstName,
        lastName: data.lastName,
        isActive: data.isActive,
        ...(data.profileAssetId && {
          profileAsset: { connect: { id: data.profileAssetId } },
        }),
        ...(data.addressId && {
          address: { connect: { id: data.addressId } },
        }),
      };

      return this.userRepository.update(tx, id, payload);
    });

    return res;
  }

  /**
   * Performs a soft delete on a user.
   * @param {string} id - The unique identifier of the user to delete
   * @param {string} deletedBy - User ID or identifier of who initiated the deletion (for audit purposes)
   * @returns {Promise<User>} The soft-deleted user object
   * @throws {NotFoundError} Throws if user not found
   */
  async deleteUser(id: string, deletedBy: string) {
    const res = await this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new NotFoundError("User not found");
      return this.userRepository.softDelete(tx, id, deletedBy);
    });

    return res;
  }

  /**
   * Updates a unique user field: username, email, or mobile.
   * Resets verification flags for email and mobile if updated.
   *
   * @param {string} id - User ID
   * @param {Object} fields - Object containing one of the fields to update
   *  { username?: string, email?: string, mobile?: string }
   * @returns {Promise<User>} Updated user object
   * @throws {NotFoundError} Throws if user not found
   * @throws {ConflictError} Throws if field already exists
   */
  async updateUniqueField(
    id: string,
    fields: { username?: string; email?: string; mobile?: string },
  ) {
    const res = await this.transaction(async (tx) => {
      // Validate the fields are unique
      await this.ensureUniqueFields(tx, fields, id);

      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new NotFoundError("User not found");

      // Prepare payload
      const payload: Prisma.UserUpdateInput = {};
      if (fields.username) payload.username = fields.username;
      if (fields.email) {
        payload.email = fields.email;
        payload.isEmailVerified = false; // reset email verification
      }
      if (fields.mobile) {
        payload.mobile = fields.mobile;
        payload.isMobileVerified = false; // reset mobile verification
      }

      return this.userRepository.update(tx, id, payload);
    });

    return res;
  }

  /**
   * Updates the email and/or mobile verification status for a user.
   * @param {string} id - User ID
   * @param {Object} flags - Object containing verification flags to update
   *  { isEmailVerified?: boolean, isMobileVerified?: boolean }
   * @returns {Promise<User>} Updated user object
   * @throws {NotFoundError} Throws if user not found
   */
  async updateVerificationStatus(
    id: string,
    flags: { isEmailVerified?: boolean; isMobileVerified?: boolean },
  ) {
    const res = await this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new NotFoundError("User not found");

      const payload: Prisma.UserUpdateInput = {};

      if (flags.isEmailVerified !== undefined) payload.isEmailVerified = flags.isEmailVerified;
      if (flags.isMobileVerified !== undefined) payload.isMobileVerified = flags.isMobileVerified;

      return this.userRepository.update(tx, id, payload);
    });

    return res;
  }

  /**
   * Private method that validates uniqueness of critical user fields.
   * @private
   * @param {Object} data - Object containing optional fields to validate (email, username, mobile)
   * @param {string} [excludeUserId] - Optional user ID to exclude from uniqueness check (for updates)
   * @returns {Promise<void>} Resolves if all checks pass
   * @throws {ConflictError} Throws if any of the fields already exist in another user record
   */
  private async ensureUniqueFields(
    db: Prisma.TransactionClient,
    data: IUniqueUserFields,
    excludeUserId?: string,
  ) {
    const checks = [];

    if (data.username) {
      checks.push(
        db.user.findFirst({
          where: {
            username: data.username,
            id: { not: excludeUserId },
            deletedAt: null,
          },
        }),
      );
    }

    if (data.email) {
      checks.push(
        db.user.findFirst({
          where: {
            email: data.email,
            id: { not: excludeUserId },
            deletedAt: null,
          },
        }),
      );
    }

    if (data.mobile) {
      checks.push(
        db.user.findFirst({
          where: {
            mobile: data.mobile,
            id: { not: excludeUserId },
            deletedAt: null,
          },
        }),
      );
    }

    const [username, email, mobile] = await Promise.all(checks);

    if (username) throw new ConflictError("Username already exists");
    if (email) throw new ConflictError("Email already exists");
    if (mobile) throw new ConflictError("Mobile already exists");
  }
}
