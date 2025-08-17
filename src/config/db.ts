import * as env from "../lib/env/env.ts";

export const connectionString = env.get("DATABASE_URL");
