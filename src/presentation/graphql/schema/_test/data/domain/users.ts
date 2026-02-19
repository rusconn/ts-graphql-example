import * as UserRepo from "../../../../../../infrastructure/unit-of-works/db/_shared/user.ts";
import { db as credentials } from "../db/credentials.ts";
import { db as users } from "../db/users.ts";

export const domain = {
  admin: UserRepo.toDomain(users.admin, credentials.admin),
  alice: UserRepo.toDomain(users.alice, credentials.alice),
};
