import * as env from "../util/envvar.ts";

export const connectionString = env.get("DATABASE_URL");
