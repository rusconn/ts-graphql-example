import * as env from "../lib/env/env.ts";

export const signingKey = new TextEncoder().encode(env.get("SIGNING_KEY"));
