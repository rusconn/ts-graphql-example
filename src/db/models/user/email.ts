import type { Tagged } from "type-fest";

import * as EmailAddress from "../../../lib/string/emailAddress.ts";

export type UserEmail = Tagged<EmailAddress.EmailAddress, "UserEmail">;

export const is = (input: unknown): input is UserEmail => {
  return EmailAddress.is(input) && input.length <= 255;
};
