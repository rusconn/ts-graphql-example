import type { RefreshToken } from "../../../infra/datasources/_shared/types.ts";
import type { Type as User } from "./dto.ts";

export interface IUserQueryForGuest {
  findByRefreshToken(token: RefreshToken["token"]): Promise<User | undefined>;
}
