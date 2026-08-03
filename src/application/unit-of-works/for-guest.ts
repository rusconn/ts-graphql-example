import type { IRefreshTokenRepoForGuest } from "../../domain/repositories/refresh-token/for-guest.ts";
import type { IUserRepoForGuest } from "../../domain/repositories/user/for-guest.ts";

export interface IUnitOfWorkForGuest {
  run<T>(work: (repos: IUnitOfWorkReposForGuest) => Promise<T>): Promise<T>;
}

export type IUnitOfWorkReposForGuest = {
  refreshToken: IRefreshTokenRepoForGuest;
  user: IUserRepoForGuest;
};
