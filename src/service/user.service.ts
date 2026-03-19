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
  IUpdateVerificationStatusPayload,
  IPaginatedCompanyUsers,
  IPaginationQuery,
} from "@type";
import { isDefined } from "@util";

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
  async getAllUsers(query: IPaginationQuery = {}): Promise<IPaginatedCompanyUsers> {
    const pagination = this.extractPagination(query);

    return this.transaction(async (tx) => {
      const { items, total } = await this.userRepository.getAllUsersGroupedByCompany(tx, pagination);

      return {
        items,
        meta: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      };
    });
  }

  /**
   * Retrieves all active users belonging to a specific company.
   * @param {string} companyId - The unique identifier of the company
   * @returns {Promise<Object>} Object containing company information and user array
   * @returns {Object} return.company - Company details (id, name, isActive) or null if not found
   * @returns {Array<User>} return.users - Array of users associated with the company
   */
  async getCompanyUsers(
    companyId: string,
    query: IPaginationQuery = {},
  ): Promise<IPaginatedCompanyUsers> {
    const pagination = this.extractPagination(query);

    return this.transaction(async (tx) => {
      const { company, users, total } = await this.userRepository.getCompanyUsers(
        tx,
        companyId,
        pagination,
      );

      if (!company) throw new NotFoundError("Company not found");

      return {
        items: [{ company, users }],
        meta: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      };
    });
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
   * @param {IUniqueUserFields} data - Fields to update
   * @returns {Promise<User>} Updated user
   */
  async updateUniqueField(id: string, data: IUniqueUserFields) {
    return this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new NotFoundError("User not found");

      const payload: Prisma.UserUpdateInput = {};
      const verificationStatusPayload: IUpdateVerificationStatusPayload = {};

      if (isDefined(data.username) && data.username !== user.username) {
        const existing = await this.userRepository.getByUsername(tx, data.username);
        if (existing) throw new ConflictError("Username already exists");
        payload.username = data.username;
      }

      if (isDefined(data.email) && data.email !== user.email) {
        if (data.email) {
          const existing = await this.userRepository.getByEmail(tx, data.email);
          if (existing) throw new ConflictError("Email already exists");
        }
        payload.email = data.email;
        verificationStatusPayload.isEmailVerified = false;
      }

      if (isDefined(data.mobile) && data.mobile !== user.mobile) {
        if (data.mobile) {
          const existing = await this.userRepository.getByMobile(tx, data.mobile);
          if (existing) throw new ConflictError("Mobile already exists");
        }
        payload.mobile = data.mobile;
        verificationStatusPayload.isMobileVerified = false;
      }

      return this.userRepository.update(tx, id, {
        ...payload,
        ...verificationStatusPayload,
      });
    });
  }

  /**
   * Updates user verification flags.
   *
   * @param {string} id - User ID
   * @param {IUpdateVerificationStatusPayload} data - Verification status payload
   * @returns {Promise<User>} Updated user
   */
  async updateVerificationStatus(id: string, data: IUpdateVerificationStatusPayload) {
    return this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new NotFoundError("User not found");

      return this.userRepository.update(tx, id, data);
    });
  }

  private async ensureUniqueFields(
    tx: Prisma.TransactionClient,
    fields: IUniqueUserFields,
  ): Promise<void> {
    const { username, email, mobile } = fields;

    if (username) {
      const existing = await this.userRepository.getByUsername(tx, username);
      if (existing) throw new ConflictError("Username already exists");
    }

    if (email) {
      const existing = await this.userRepository.getByEmail(tx, email);
      if (existing) throw new ConflictError("Email already exists");
    }

    if (mobile) {
      const existing = await this.userRepository.getByMobile(tx, mobile);
      if (existing) throw new ConflictError("Mobile already exists");
    }
  }
}
