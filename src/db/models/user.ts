import type { OverrideProperties } from "type-fest";

import type { UserInsert, UserSelect, UserUpdate } from "../generated/types-extension.ts";
import type { UserEmail } from "./user/email.ts";
import type { UserId } from "./user/id.ts";
import type { UserToken } from "./user/token.ts";

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
    id?: UserId;
    email?: UserEmail;
    token?: UserToken | null;
  }
>;
