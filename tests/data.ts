import * as UT from "../src/graphql/_test/data.ts";

import { refreshTokens } from "./data/client/refresh-tokens.ts";
import { tokens } from "./data/client/tokens.ts";

export const client = {
  refreshTokens,
  tokens,
};
export const db = UT.db;
export const domain = UT.domain;
export const graph = UT.graph;
