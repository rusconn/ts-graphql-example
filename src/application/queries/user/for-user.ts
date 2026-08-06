import type { Type as User } from "../../dto/user.ts";

export interface IUserQueryForUser {
  find(id: User["id"]): Promise<User | undefined>;
}
