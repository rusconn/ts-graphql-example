import { domain } from "../config/url.ts";
import type { RefreshToken } from "../domain/user-token/refresh-token.ts";

const cookieName = "refresh_token";

export const getRefreshTokenCookie = async (request: Request) => {
  return await request.cookieStore!.get(cookieName);
};

export const setRefreshTokenCookie = async (request: Request, refreshToken: RefreshToken) => {
  await request.cookieStore!.set({
    name: cookieName,
    value: refreshToken,
    domain,
    expires: new Date("2037-12-31T23:59:59.999Z"),
    secure: true,
    sameSite: "lax",
    httpOnly: true,
  });
};
