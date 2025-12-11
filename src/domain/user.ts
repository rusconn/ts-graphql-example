import * as UserEmail from "./user/email.ts";
import * as UserId from "./user/id.ts";
import * as UserPassword from "./user/password.ts";
import * as UserToken_ from "./user/token.ts";

export { UserEmail, UserId, UserPassword, UserToken_ as UserToken };

export type User = {
  id: UserId.UserId;
  name: string;
  email: UserEmail.UserEmail;
  password: UserPassword.UserPasswordHashed;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type UserToken = {
  id: UserId.UserId;
  token: UserToken_.UserToken;
};

export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
