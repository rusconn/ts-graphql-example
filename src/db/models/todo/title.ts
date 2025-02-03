import type { Tagged } from "type-fest";

export type TodoTitle = Tagged<string, "TodoTitle">;

export const is = (s: string): s is TodoTitle => {
  return s.length <= 255;
};
