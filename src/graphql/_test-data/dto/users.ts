import * as Dto from "../../../application/queries/dto.ts";
import { db as users } from "../db/users.ts";

export const dto = {
  admin: Dto.User.parseOrThrow(users.admin),
  alice: Dto.User.parseOrThrow(users.alice),
};
