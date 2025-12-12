import type { Except } from "type-fest";

import * as UserEmail from "./user/email.ts";
import * as UserId from "./user/id.ts";
import * as UserPassword from "./user/password.ts";

export { UserEmail, UserId, UserPassword };

export type User = {
  id: UserId.UserId;
  name: string;
  email: UserEmail.UserEmail;
  password: UserPassword.UserPasswordHashed;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

type Input = Except<User, "id" | "password" | "role" | "createdAt" | "updatedAt"> & {
  password: string;
};

export const create = async ({ password, ...rest }: Input): Promise<User> => {
  const { id, date } = UserId.genWithDate();
  const hashedPassword = await UserPassword.hash(password);
  return {
    ...rest,
    id,
    password: hashedPassword,
    role: UserRole.USER,
    createdAt: date,
    updatedAt: date,
  };
};
