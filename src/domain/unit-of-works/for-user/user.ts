import type * as Domain from "../../models.ts";

export interface IUserRepoForUser {
  add(user: Domain.User.Type): Promise<void>;

  update(user: Domain.User.Type): Promise<void>;

  remove(id: Domain.User.Type["id"]): Promise<void>;
}
