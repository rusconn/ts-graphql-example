import type { Type as User } from "../../dto/user.ts";
import type * as UserLoader from "./loaders/user.ts";

export interface IUserQueryForUser {
  find(id: User["id"]): Promise<User | undefined>;

  load(key: UserLoader.Key): Promise<User | undefined>;
}
