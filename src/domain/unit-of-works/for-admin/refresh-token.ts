import type * as Domain from "../../models.ts";

export interface IRefreshTokenRepoForAdmin {
  add(refreshToken: Domain.RefreshToken.Type): Promise<void>;

  touch(token: Domain.RefreshToken.Type["token"], now: Date): Promise<void>;

  retainLatest(userId: Domain.RefreshToken.Type["userId"], limit: number): Promise<void>;

  remove(token: Domain.RefreshToken.Type["token"]): Promise<void>;

  removeByUserId(userId: Domain.RefreshToken.Type["userId"]): Promise<void>;
}
