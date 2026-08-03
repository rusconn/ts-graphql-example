import type * as Domain from "../../entities.ts";

export interface IRefreshTokenRepoForGuest {
  add(refreshToken: Domain.RefreshToken.Type): Promise<void>;

  retainLatest(userId: Domain.RefreshToken.Type["userId"], limit: number): Promise<void>;

  remove(token: Domain.RefreshToken.Type["token"]): Promise<void>;
}
