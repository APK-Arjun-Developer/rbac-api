export type TExcludeFields =
  | "createdAt"
  | "createdBy"
  | "updatedAt"
  | "updatedBy"
  | "deletedAt"
  | "deletedBy"
  | "password";

export interface IIdParams {
  id: string;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
}
