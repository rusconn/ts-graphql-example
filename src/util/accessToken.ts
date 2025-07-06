import { jwtVerify, SignJWT } from "jose";
import { JWTExpired, JWTInvalid } from "jose/errors";

import { signingKey } from "../config/jwt.ts";
import type { User } from "../models/user.ts";

type Payload = Pick<User, "id" | "role">;

export const verifyJwt = async (token: string) => {
  try {
    const result = await jwtVerify<Payload>(token, signingKey);
    return { type: "Success", ...result } as const;
  } catch (e) {
    if (e instanceof JWTInvalid) return { type: "JWTInvalid" } as const;
    if (e instanceof JWTExpired) return { type: "JWTExpired" } as const;
    return {
      type: "Unknown",
      error: e instanceof Error ? e : new Error("Unknown", { cause: e }),
    } as const;
  }
};

export const signedJwt = async ({ id, role }: Payload) => {
  return await new SignJWT({ id, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30min")
    .sign(signingKey);
};
