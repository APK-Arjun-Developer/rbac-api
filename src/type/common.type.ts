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
