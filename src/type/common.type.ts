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
  page?: number | string;
  limit?: number | string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  items: T[];
  meta: IPaginationMeta;
}
