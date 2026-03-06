export interface User {
  id: string;
  addressId: string;
  profileAssetId: string | null;
  isActive: boolean;
  systemRoleId: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
}

export interface IGetAllUsers {
  company: {
    id: string;
    name: string;
    isActive: boolean;
  };
  users: User[];
}
