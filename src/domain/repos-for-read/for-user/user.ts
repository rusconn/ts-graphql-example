import type * as Domain from "../../entities.ts";

export interface IUserReaderRepoForUser {
  find(id: Domain.User.Type["id"]): Promise<Domain.User.Type | undefined>;
}
