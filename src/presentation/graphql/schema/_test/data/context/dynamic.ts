import { CookieStore } from "@whatwg-node/cookie-store";

import type { Context } from "../../../../yoga/context.ts";
import * as Static from "./static.ts";

export type ContextForIT = ReturnType<(typeof context)[keyof typeof context]>;

export const context = {
  admin: () => ({
    ...Static.context.admin,
    request: {
      cookieStore: new CookieStore(""),
    },
  }),
  alice: () => ({
    ...Static.context.alice,
    request: {
      cookieStore: new CookieStore(""),
    },
  }),
  guest: () => ({
    ...Static.context.guest,
    request: {
      cookieStore: new CookieStore(""),
    },
  }),
} as const satisfies Record<
  string,
  () => Pick<Context, "role" | "user"> & {
    request: ServerPluginRequest;
  }
>;

// @whatwg-node/server-plugin-cookiesの模倣
type ServerPluginRequest = {
  cookieStore: CookieStore;
};
