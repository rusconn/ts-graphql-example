import { domain } from "../config/url.ts";

export const getRefreshTokenCookie = async (request: Request) => {
  return await request.cookieStore!.get("refresh_token");
};

export const setRefreshTokenCookie = async (request: Request, refreshToken: string) => {
  await request.cookieStore!.set({
    name: "refresh_token",
    value: refreshToken,
    domain,
    expires: new Date("2037-12-31T23:59:59.999Z"),
    secure: true,
    sameSite: "lax",
    httpOnly: true,
  });
};
