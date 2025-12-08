import type { UserEmail } from "./user/email.ts";
import type { UserId } from "./user/id.ts";
import type { UserPasswordHashed } from "./user/password.ts";
import type { UserTokenHashed } from "./user/token.ts";

export type User = {
  id: UserId;
  name: string;
  email: UserEmail;
  role: "ADMIN" | "USER";
  updatedAt: Date;
};

export type UserWithCredential = User & {
  password: UserPasswordHashed;
};

export type UserFull = User & {
  password: UserPasswordHashed;
  token: UserTokenHashed;
};
