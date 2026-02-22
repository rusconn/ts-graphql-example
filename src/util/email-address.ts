import type { Tagged } from "type-fest";

import * as Email from "../lib/string/email-address.ts";

export type EmailAddress = Tagged<string, "EmailAddress">;

export const is = (input: unknown): input is EmailAddress => {
  return typeof input === "string" && Email.is(input);
};
