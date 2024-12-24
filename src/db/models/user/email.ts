import type { Tagged } from "type-fest";

import type { EmailAddress } from "../../../lib/string/emailAddress.ts";
import * as emailAddress from "../../../lib/string/emailAddress.ts";

export type UserEmail = Tagged<EmailAddress, "UserEmail">;

export const is = (input: string): input is UserEmail => {
  return emailAddress.is(input);
};
