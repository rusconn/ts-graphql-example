import type { IRefreshTokenRepoForAdmin } from "../../domain/repositories/refresh-token/for-admin.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";

export interface IUnitOfWorkForAdmin {
  run<T>(work: (repos: IUnitOfWorkReposForAdmin) => Promise<T>): Promise<T>;
}

export type IUnitOfWorkReposForAdmin = {
  refreshToken: IRefreshTokenRepoForAdmin;
  todo: ITodoRepoForAdmin;
  user: IUserRepoForAdmin;
};
