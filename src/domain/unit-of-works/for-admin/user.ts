import type * as Domain from "../../entities.ts";

export interface IUserRepoForAdmin {
  add(user: Domain.User.Type): Promise<void>;

  update(user: Domain.User.Type): Promise<void>;

  remove(id: Domain.User.Type["id"]): Promise<void>;
}
