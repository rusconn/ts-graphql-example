import type * as Domain from "../../entities.ts";

export interface IUserReaderRepoForGuest {
  findByEmail(email: Domain.User.Type["email"]): Promise<Domain.User.Type | undefined>;
}
