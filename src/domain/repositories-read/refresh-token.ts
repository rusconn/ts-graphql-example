import type * as Domain from "../entities.ts";

export interface IRefreshTokenReaderRepo {
  find(token: Domain.RefreshToken.Type["token"]): Promise<Domain.RefreshToken.Type | undefined>;
}
