import { domain } from "../config/url.ts";
import type { RefreshToken } from "../domain/entities.ts";
import type { Context } from "../server/context.ts";

const cookieName = "refresh_token";

export const getRefreshTokenCookie = async (context: Context) => {
  return await context.request.cookieStore!.get(cookieName);
};

export const setRefreshTokenCookie = async (
  context: Context,
  refreshToken: RefreshToken.Token.Type,
  expires: RefreshToken.Type["expiresAt"],
) => {
  await context.request.cookieStore!.set({
    ...cookieBase,
    value: refreshToken,
    expires,
  });
};

export const deleteRefreshTokenCookie = async (context: Context) => {
  await context.request.cookieStore!.set({
    ...cookieBase,
    value: "",
    expires: 0,
  });
};

const cookieBase = {
  name: cookieName,
  domain,
  secure: true,
  sameSite: "lax",
  httpOnly: true,
} as const;
