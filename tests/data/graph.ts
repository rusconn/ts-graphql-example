import * as DB from "./db.js";
import { todoNode, userNode } from "./helpers.js";

export const admin = userNode(DB.admin);
export const alice = userNode(DB.alice);
export const bob = userNode(DB.bob);

export const adminTodo1 = todoNode(DB.adminTodo1);
export const adminTodo2 = todoNode(DB.adminTodo2);
export const adminTodo3 = todoNode(DB.adminTodo3);
export const aliceTodo = todoNode(DB.aliceTodo);
export const bobTodo = todoNode(DB.bobTodo);

export const validUserIds = [admin, alice, bob].map(({ id }) => id);

export const validTodoIds = [adminTodo1, adminTodo2, adminTodo3].map(({ id }) => id);

export const validNodeIds = [...validUserIds, ...validTodoIds];

export const invalidUserIds = [
  "Usr:01H75CPZGG1YW9W79M7WWT6KFB",
  "User01H75CPZGG1YW9W79M7WWT6KFB",
  "01H75CPZGG1YW9W79M7WWT6KFB",
  ":01H75CPZGG1YW9W79M7WWT6KFB",
  "01H75CPZGG1YW9W79M7WWT6KFB:User",
  "",
  validTodoIds[0],
] as const;

export const invalidTodoIds = [
  "Too:01H75CR8C6PQK7Z7RE4FBY1B4M",
  "Todo01H75CR8C6PQK7Z7RE4FBY1B4M",
  "01H75CR8C6PQK7Z7RE4FBY1B4M",
  ":01H75CR8C6PQK7Z7RE4FBY1B4M",
  "01H75CR8C6PQK7Z7RE4FBY1B4M:Todo",
  "",
  validUserIds[0],
] as const;

export const invalidIds = [...invalidUserIds.slice(0, -1), ...invalidTodoIds.slice(0, -1)];
