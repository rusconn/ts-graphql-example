import type { IRefreshTokenRepoForUser } from "./for-user/refresh-token.ts";
import type { ITodoRepoForUser } from "./for-user/todo.ts";
import type { IUserRepoForUser } from "./for-user/user.ts";

export interface IUnitOfWorkForUser {
  run<T>(work: (repos: IUnitOfWorkReposForUser) => Promise<T>): Promise<T>;
}

export type IUnitOfWorkReposForUser = {
  refreshToken: IRefreshTokenRepoForUser;
  todo: ITodoRepoForUser;
  user: IUserRepoForUser;
};
