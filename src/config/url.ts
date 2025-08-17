import * as env from "../lib/env/env.ts";

export const domain = env.get("DOMAIN");
export const port = env.getInt("PORT");
export const endpoint = `${env.get("BASE_URL")}:${port}/graphql`;
