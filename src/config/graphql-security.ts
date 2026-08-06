import * as env from "../util/envvar.ts";

export const maxDepth = env.getInt("QUERY_MAX_DEPTH");
export const maxTokens = env.getInt("QUERY_MAX_TOKENS");
export const maxAliases = env.getInt("QUERY_MAX_ALIASES");
export const maxComplexity = env.getInt("QUERY_MAX_COMPLEXITY");
