import type * as Domain from "../../../domain/user-token.ts";
import { mappers } from "../../../mappers.ts";
import { db as userTokens } from "../db/user-tokens.ts";

export const domain = {
  admin: mappers.userToken.toDomain(userTokens.admin),
  alice: mappers.userToken.toDomain(userTokens.alice),
} satisfies Record<string, Domain.UserToken>;
