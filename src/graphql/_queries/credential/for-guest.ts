import type * as Domain from "../../../domain/models.ts";
import type { Type as Credential } from "../../_dto/credential.ts";

export interface ICredentialQueryForGuest {
  findByEmail(email: Domain.User.Type["email"]): Promise<Credential | undefined>;
}
