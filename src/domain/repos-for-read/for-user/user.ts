import type * as Domain from "../../models.ts";

export interface IUserReaderRepoForUser {
  find(id: Domain.User.Type["id"]): Promise<Domain.User.Type | undefined>;
}
