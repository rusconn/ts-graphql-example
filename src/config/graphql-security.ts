import * as env from "../util/envvar.ts";

export const maxDepth = env.getInt("QUERY_MAX_DEPTH");
export const maxComplexity = env.getInt("QUERY_MAX_COMPLEXITY");
