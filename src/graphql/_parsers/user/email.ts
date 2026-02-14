import { User } from "../../../domain/entities.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseUserEmail = parseStringArg(User.Email.parse, {
  maxChars: User.Email.MAX,
});
