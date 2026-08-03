import type * as Domain from "../../entities.ts";

export interface IUserRepoForGuest {
  add(user: Domain.User.Type): Promise<void>;

  update(user: Domain.User.Type): Promise<void>;
}
