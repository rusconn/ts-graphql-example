import { sign } from "../../src/presentation/_shared/auth/access-token.ts";
import { refreshTokens } from "../../src/presentation/_shared/test/data/client/refresh-tokens.ts";
import * as UT from "../../src/presentation/graphql/schema/_test/data.ts";

export const db = UT.db;
export const dto = UT.dto;
export const domain = UT.domain;

export const client = {
  refreshTokens,
  tokens: {
    admin: await sign(domain.users.admin),
    alice: await sign(domain.users.alice),
  },
};
