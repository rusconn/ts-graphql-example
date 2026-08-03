import type { IRefreshTokenRepoForUser } from "../../domain/repositories/refresh-token/for-user.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";

export interface IUnitOfWorkForUser {
  run<T>(work: (repos: IUnitOfWorkReposForUser) => Promise<T>): Promise<T>;
}

export type IUnitOfWorkReposForUser = {
  refreshToken: IRefreshTokenRepoForUser;
  todo: ITodoRepoForUser;
  user: IUserRepoForUser;
};
