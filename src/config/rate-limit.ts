import * as env from "../util/envvar.ts";

export const capacity = env.getInt("RATE_LIMIT_CAPACITY");
export const refillPerSecond = env.getInt("RATE_LIMIT_REFILL_PER_SECOND");
