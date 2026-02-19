import { jwtVerify, SignJWT } from "jose";
import { JWTExpired, JWTInvalid } from "jose/errors";

import type { User } from "../../../application/dto.ts";
import { signingKey } from "../../../config/access-token.ts";

export type Payload = Pick<User.Type, "id">;

export const verify = async (token: string) => {
  try {
    const result = await jwtVerify<Payload>(token, signingKey);
    return { type: "Success", ...result } as const;
  } catch (e) {
    if (e instanceof JWTInvalid) return { type: "Invalid" } as const;
    if (e instanceof JWTExpired) return { type: "Expired" } as const;
    return {
      type: "Unknown",
      error: Error.isError(e) ? e : new Error("Unknown", { cause: e }),
    } as const;
  }
};

export const sign = async ({ id }: Payload) => {
  return await new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15min")
    .sign(signingKey);
};
