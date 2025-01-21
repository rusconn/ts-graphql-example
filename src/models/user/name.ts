import type { Tagged } from "type-fest";

export type UserName = Tagged<string, "UserName">;

export const is = (input: string): input is UserName => {
  return regex.test(input);
};

const regex = /^[a-zA-Z0-9_]+$/;
