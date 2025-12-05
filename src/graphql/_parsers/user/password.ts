import { parseStringArg } from "../util.ts";

export const USER_PASSWORD_MIN = 8;
export const USER_PASSWORD_MAX = 50;

export const parseUserPassword = parseStringArg({
  minChars: USER_PASSWORD_MIN,
  maxChars: USER_PASSWORD_MAX,
});
