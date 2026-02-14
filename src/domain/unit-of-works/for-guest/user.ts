import type * as Domain from "../../models.ts";

export interface IUserRepoForGuest {
  add(user: Domain.User.Type): Promise<void>;

  update(user: Domain.User.Type): Promise<void>;
}
