import * as RefreshTokenRepo from "../../../../infra/unit-of-works/db/_shared/refresh-token.ts";
import { db as refreshTokens } from "../db/refresh-tokens.ts";

export const domain = {
  admin: RefreshTokenRepo.toDomain(refreshTokens.admin),
  alice: RefreshTokenRepo.toDomain(refreshTokens.alice),
};
