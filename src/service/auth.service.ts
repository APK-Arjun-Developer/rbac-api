import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, env } from "@config";
import { BaseService, NotFoundError, UnauthorizedError } from "@service";
import { UserRepository } from "@repository";
import { IAuthUser, IJwtPayload, ILoginPayload } from "@type";

export class AuthService extends BaseService {
  private readonly userRepository: UserRepository;

  constructor() {
    super(db, "AuthService");
    this.userRepository = new UserRepository();
  }

  async login(payload: ILoginPayload) {
    return this.transaction(async (tx) => {
      const user = await this.userRepository.getByUsername(tx, payload.username);

      if (!user || user.deletedAt || !user.isActive) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(payload.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
      }

      return {
        accessToken: this.generateAccessToken({ userId: user.id }),
      };
    });
  }

  async getAuthUser(userId: string): Promise<IAuthUser> {
    return this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, userId);

      if (!user || user.deletedAt || !user.isActive) {
        throw new UnauthorizedError("Unauthorized");
      }

      return {
        userId: user.id,
        systemRole: user.systemRole,
        companyId:
          user.userCompanies.find((userCompany) => userCompany.deletedAt === null)?.companyId ?? null,
      };
    });
  }

  async getPrimaryCompanyId(userId: string) {
    const authUser = await this.getAuthUser(userId);
    const { companyId } = authUser;

    if (!companyId) {
      throw new NotFoundError("Company not found for user");
    }

    return companyId;
  }

  private generateAccessToken(payload: IJwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });
  }
}

export const authService = new AuthService();
