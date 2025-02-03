import type { ConnectionArgumentsUnion } from "./interfaces.ts";

export function isForwardPagination<Cursor>(args: ConnectionArgumentsUnion<Cursor>) {
  return "first" in args;
}
