import type { User } from "./user.ts";
import * as UserPassword from "./user-credential/password.ts";

export { UserPassword };

export type UserCredential = {
  id: User["id"];
  password: UserPassword.UserPasswordHashed;
};

type Input = {
  userId: User["id"];
  password: string;
};

export const create = async ({ userId, password }: Input): Promise<UserCredential> => {
  const hashedPassword = await UserPassword.hash(password);
  return {
    id: userId,
    password: hashedPassword,
  };
};
