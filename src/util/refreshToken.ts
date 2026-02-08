import { domain } from "../config/url.ts";
import type { RefreshToken } from "../domain/models.ts";

const cookieName = "refresh_token";

export const getRefreshTokenCookie = async (request: Request) => {
  return await request.cookieStore!.get(cookieName);
};

export const setRefreshTokenCookie = async (
  request: Request,
  refreshToken: RefreshToken.Token.Type,
) => {
  await request.cookieStore!.set({
    ...cookieBase,
    value: refreshToken,
    expires: new Date("2037-12-31T23:59:59.999Z"),
  });
};

export const deleteRefreshTokenCookie = async (request: Request) => {
  await request.cookieStore!.set({
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
