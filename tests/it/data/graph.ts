import * as DB from "./db";
import { toTodoNode, toUserNode } from "./helpers";

export const admin = toUserNode(DB.admin);
export const alice = toUserNode(DB.alice);
export const bob = toUserNode(DB.bob);

export const adminTodo1 = toTodoNode(DB.adminTodo1);
export const adminTodo2 = toTodoNode(DB.adminTodo2);
export const adminTodo3 = toTodoNode(DB.adminTodo3);
export const aliceTodo = toTodoNode(DB.aliceTodo);
export const bobTodo = toTodoNode(DB.bobTodo);

export const validUserIds = [admin, alice, bob].map(({ id }) => id);

export const validTodoIds = [adminTodo1, adminTodo2, adminTodo3].map(({ id }) => id);

export const validNodeIds = [...validUserIds, ...validTodoIds];

export const invalidUserIds = [
  "Usr:a4kxogX92Wxe-kbUfDRX7",
  "Usera4kxogX92Wxe-kbUfDRX7",
  "a4kxogX92Wxe-kbUfDRX7",
  ":a4kxogX92Wxe-kbUfDRX7",
  "a4kxogX92Wxe-kbUfDRX7:User",
  "",
  validTodoIds[0],
] as const;

export const invalidTodoIds = [
  "Too:aHbtLGE7ANe1CSDbnhZQZ",
  "TodoaHbtLGE7ANe1CSDbnhZQZ",
  "aHbtLGE7ANe1CSDbnhZQZ",
  ":aHbtLGE7ANe1CSDbnhZQZ",
  "aHbtLGE7ANe1CSDbnhZQZ:Todo",
  "",
  validUserIds[0],
] as const;

export const invalidIds = [...invalidUserIds.slice(0, -1), ...invalidTodoIds.slice(0, -1)];
