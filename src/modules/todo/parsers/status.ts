import type { MutationUpdateTodoArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  status?: MutationUpdateTodoArgs["status"];
};

export const parseTodoStatus = <T extends boolean, U extends boolean>(
  { status }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && status === undefined) {
    return parseErr('"status" is required');
  }
  if (!nullable && status === null) {
    return parseErr('"status" must not be null');
  }

  return status as T extends true
    ? U extends true
      ? Input["status"]
      : Exclude<Input["status"], null>
    : NonNullable<Input["status"]>;
};
