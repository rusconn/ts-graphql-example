import type { Tagged } from "type-fest";

export type EmailAddress = Tagged<string, "EmailAddress">;

export const is = (input: string): input is EmailAddress => {
  return emailRegex.test(input);
};

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
