import { User } from "../../../domain/entities.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseUserPassword = parseStringArg(User.Password.parse, {
  minChars: User.Password.MIN,
  maxChars: User.Password.MAX,
});
