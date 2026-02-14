import type { IRefreshTokenRepoForGuest } from "./for-guest/refresh-token.ts";
import type { IUserRepoForGuest } from "./for-guest/user.ts";

export interface IUnitOfWorkForGuest {
  run<T>(work: (repos: IUnitOfWorkReposForGuest) => Promise<T>): Promise<T>;
}

export type IUnitOfWorkReposForGuest = {
  refreshToken: IRefreshTokenRepoForGuest;
  user: IUserRepoForGuest;
};
