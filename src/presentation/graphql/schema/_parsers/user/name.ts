import { User } from "../../../../../domain/entities.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseUserName = parseStringArg(User.Name.parse, {
  minChars: User.Name.MIN,
  maxChars: User.Name.MAX,
});
