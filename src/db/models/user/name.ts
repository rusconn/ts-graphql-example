import type { Tagged } from "type-fest";

export type UserName = Tagged<string, "UserName">;

export const is = (s: string): s is UserName => {
  return s.length <= 100;
};
