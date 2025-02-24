import type { Except, OverrideProperties } from "type-fest";

import type { UserCredentialInsert, UserInsert, UserSelect } from "../db/types-extension.ts";
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
  Except<UserInsert, "id" | "updatedAt"> & Pick<UserCredentialInsert, "password">,
  {
    email: UserEmail;
  }
>;

export type UserUpd = Partial<Except<UserNew, "password">>;
