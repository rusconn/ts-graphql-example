import { parseStringArg } from "../util.ts";

export const USER_NAME_MIN = 1;
export const USER_NAME_MAX = 100;

export const parseUserName = parseStringArg({
  minChars: USER_NAME_MIN,
  maxChars: USER_NAME_MAX,
});
