import { User } from "../../../domain/models.ts";
import { parseStringArg } from "../util.ts";

export const parseUserPassword = parseStringArg(User.Password.parse, {
  minChars: User.Password.MIN,
  maxChars: User.Password.MAX,
});
