import type * as Domain from "../../models.ts";

export interface IUserReaderRepoForAdmin {
  find(id: Domain.User.Type["id"]): Promise<Domain.User.Type | undefined>;
}
