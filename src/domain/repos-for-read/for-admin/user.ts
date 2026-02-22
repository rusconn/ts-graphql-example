import type * as Domain from "../../entities.ts";

export interface IUserReaderRepoForAdmin {
  find(id: Domain.User.Type["id"]): Promise<Domain.User.Type | undefined>;

  findByEmail(email: Domain.User.Type["email"]): Promise<Domain.User.Type | undefined>;
}
