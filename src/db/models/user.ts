import type { OverrideProperties } from "type-fest";

import type { UserInsert, UserSelect, UserUpdate } from "../generated/types-extension.ts";
import type { UserEmail } from "./user/email.ts";
import type { UserId } from "./user/id.ts";
import type { UserToken } from "./user/token.ts";

export type UserKeyCols = "id" | "email" | "token";
export type UserKey = Exclude<User[UserKeyCols], null>;

export type User = OverrideProperties<
  UserSelect,
  {
    id: UserId;
    email: UserEmail;
    token: UserToken | null;
  }
>;

export type NewUser = OverrideProperties<
  UserInsert,
  {
    id: UserId;
    email: UserEmail;
    token?: UserToken | null;
  }
>;

export type UpdUser = OverrideProperties<
  UserUpdate,
  {
    email?: UserEmail;
    token?: UserToken | null;
  }
>;
