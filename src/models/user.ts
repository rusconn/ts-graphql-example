import type { Except, OverrideProperties } from "type-fest";

import type { UserCredentialInsert, UserInsert, UserSelect } from "../db/types-extension.ts";
import type { URL as URL_ } from "../lib/string/url.ts";
import type { UserEmail } from "./user/email.ts";
import type { UserId } from "./user/id.ts";
import type { UserName } from "./user/name.ts";
import type { UserPassword } from "./user/password.ts";
import type { UserToken } from "./user/token.ts";

export type User = OverrideProperties<
  UserSelect,
  {
    id: UserId;
    avatar: URL_ | null;
    name: UserName;
    website: URL_;
    email: UserEmail;
  }
>;

export type UserWithCredential = User & {
  password: UserPassword;
};

export type UserWithToken = User & {
  token: UserToken;
};

export type UserFull = User & {
  password: UserWithCredential["password"];
  token: UserWithToken["token"];
};

export type UserNew = OverrideProperties<
  Except<UserInsert, "id" | "updatedAt"> & Pick<UserCredentialInsert, "password">,
  {
    avatar?: URL_ | null;
    name: UserName;
    website?: URL_;
    email: UserEmail;
  }
>;

export type UserUpd = Partial<Except<UserNew, "password">>;
