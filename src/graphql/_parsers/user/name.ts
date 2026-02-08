import { User } from "../../../domain/models.ts";
import { parseStringArg } from "../util.ts";

export const parseUserName = parseStringArg(User.Name.parse, {
  minChars: User.Name.MIN,
  maxChars: User.Name.MAX,
});
