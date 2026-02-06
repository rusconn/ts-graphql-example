import type * as Domain from "../../../domain/user-credential.ts";
import { mappers } from "../../../mappers.ts";
import { db as userCredentials } from "../db/user-credentials.ts";

export const domain = {
  admin: mappers.userCredential.toDomain(userCredentials.admin),
  alice: mappers.userCredential.toDomain(userCredentials.alice),
} satisfies Record<string, Domain.UserCredential>;
