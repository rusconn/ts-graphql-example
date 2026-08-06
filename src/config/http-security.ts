import * as env from "../util/envvar.ts";

export const maxBodyBytes = env.getInt("HTTP_MAX_BODY_BYTES");
export const requestTimeoutMs = env.getInt("HTTP_REQUEST_TIMEOUT_MS");
