import * as RefreshTokenRepo from "../../../../../infrastructure/repositories/refresh-token/shared.ts";
import { db as refreshTokens } from "../db/refresh-tokens.ts";

export const domain = {
  admin: RefreshTokenRepo.toDomain(refreshTokens.admin),
  alice: RefreshTokenRepo.toDomain(refreshTokens.alice),
};
