import type { CookieListItem } from "@whatwg-node/cookie-store";
import type { Except } from "type-fest";

import { domain } from "../../../config/url.ts";
import type { RefreshToken } from "../../../domain/entities.ts";
import type { Context } from "../../graphql/yoga/context.ts";

export const name = "refresh_token";

export async function get(context: Context) {
  return await context.request.cookieStore!.get(name);
}

export async function set(
  context: Context,
  input: {
    value: RefreshToken.Token.Type;
    expires: RefreshToken.Type["expiresAt"];
  },
) {
  await context.request.cookieStore!.set({
    ...base,
    value: input.value,
    expires: input.expires,
  });
}

export async function clear(context: Context) {
  await context.request.cookieStore!.set({
    ...base,
    value: "",
    expires: 0,
  });
}

export const base: Except<CookieListItem, "expires"> = {
  name,
  domain,
  secure: true,
  sameSite: "lax",
  httpOnly: true,
};
