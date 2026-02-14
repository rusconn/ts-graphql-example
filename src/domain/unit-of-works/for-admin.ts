import type { IRefreshTokenRepoForAdmin } from "./for-admin/refresh-token.ts";
import type { ITodoRepoForAdmin } from "./for-admin/todo.ts";
import type { IUserRepoForAdmin } from "./for-admin/user.ts";

export interface IUnitOfWorkForAdmin {
  run<T>(work: (repos: IUnitOfWorkReposForAdmin) => Promise<T>): Promise<T>;
}

export type IUnitOfWorkReposForAdmin = {
  refreshToken: IRefreshTokenRepoForAdmin;
  todo: ITodoRepoForAdmin;
  user: IUserRepoForAdmin;
};
