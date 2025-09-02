import type { Except, OverrideProperties } from "type-fest";

import type { NewUser, NewUserCredential, User as UserSelect } from "../db/types.ts";
import type { UserEmail } from "./user/email.ts";
import type { UserId } from "./user/id.ts";
import type { UserPasswordHashed } from "./user/password.ts";
import type { UserTokenHashed } from "./user/token.ts";

export type User = OverrideProperties<
  UserSelect,
  {
    id: UserId;
    email: UserEmail;
  }
>;

export type UserWithCredential = User & {
  password: UserPasswordHashed;
};

export type UserFull = User & {
  password: UserPasswordHashed;
  token: UserTokenHashed;
};

export type UserNew = OverrideProperties<
  Except<NewUser, "id" | "updatedAt"> & Pick<NewUserCredential, "password">,
  {
    email: UserEmail;
  }
>;

export type UserUpd = Partial<Except<UserNew, "password">>;
