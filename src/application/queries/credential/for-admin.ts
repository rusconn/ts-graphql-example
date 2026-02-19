import type * as Domain from "../../../domain/entities.ts";
import type { Type as Credential } from "../../dto/credential.ts";

export interface ICredentialQueryForAdmin {
  findByEmail(email: Domain.User.Type["email"]): Promise<Credential | undefined>;
}
