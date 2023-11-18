import * as todo from "../../todo/common/test.ts";
import * as user from "../../user/common/test.ts";

export const validNodeIds = [...todo.validTodoIds, ...user.validUserIds];

export const invalidNodeIds = [
  ...todo.invalidTodoIds.slice(0, -1),
  ...user.invalidUserIds.slice(0, -1),
];
