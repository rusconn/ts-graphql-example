import * as env from "../util/envvar.ts";

export const maxBodyBytes = env.getInt("HTTP_MAX_BODY_BYTES");
