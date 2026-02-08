import type { RefreshToken } from "../../../infra/datasources/_shared/types.ts";
import type { Type as User } from "../../_dto/user.ts";
import type * as UserLoader from "./loaders/user.ts";

export interface IUserQueryForUser {
  find(id: User["id"]): Promise<User | undefined>;

  findByRefreshToken(token: RefreshToken["token"]): Promise<User | undefined>;

  load(key: UserLoader.Key): Promise<User | undefined>;
}
