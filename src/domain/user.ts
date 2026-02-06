import type { Except } from "type-fest";

import * as UserEmail from "./user/email.ts";
import * as UserId from "./user/id.ts";

export { UserEmail, UserId };

export type User = {
  id: UserId.UserId;
  name: string;
  email: UserEmail.UserEmail;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

type Input = Except<User, "id" | "role" | "createdAt" | "updatedAt">;

export const create = async ({ name, email }: Input): Promise<User> => {
  const { id, date } = UserId.genWithDate();
  return {
    id,
    name,
    email,
    role: UserRole.USER,
    createdAt: date,
    updatedAt: date,
  };
};
