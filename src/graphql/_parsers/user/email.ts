import { User } from "../../../domain/models.ts";
import { parseStringArg } from "../util.ts";

export const parseUserEmail = parseStringArg(User.Email.parse, {
  maxChars: User.Email.MAX,
});
