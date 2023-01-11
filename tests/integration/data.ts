import { Graph } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";

export const admin = {
  id: "User:a4kxogX92Wxe-kbUfDRX7",
  name: nonEmptyString("Admin"),
  role: Graph.Role.Admin,
  token: nonEmptyString("admin token"),
  createdAt: new Date(0),
  updatedAt: new Date(3),
} as const;

export const alice = {
  id: "User:bYzHPCFPTkTPHNbCBkh8H",
  name: nonEmptyString("Alice"),
  role: Graph.Role.User,
  token: nonEmptyString("alice token"),
  createdAt: new Date(1),
  updatedAt: new Date(1),
} as const;

export const bob = {
  id: "User:cuEgH4iyoMMm6CzhWLR9S",
  name: nonEmptyString("Bob"),
  role: Graph.Role.User,
  token: nonEmptyString("bob token"),
  createdAt: new Date(2),
  updatedAt: new Date(2),
} as const;

export const guest = {
  id: "User:d9QWU0PPanh9HAWqdYRLx",
  name: nonEmptyString("Guest"),
  role: Graph.Role.Guest,
  token: undefined,
  createdAt: undefined,
  updatedAt: undefined,
} as const;

export const adminTodo1 = {
  id: "Todo:aHbtLGE7ANe1CSDbnhZQZ",
  title: nonEmptyString("admin todo 1"),
  createdAt: new Date(1),
  updatedAt: new Date(6),
  description: "admin todo 1",
  status: Graph.TodoStatus.Pending,
  userId: admin.id,
} as const;

export const adminTodo2 = {
  id: "Todo:bJKfvOLA7kyPS1DE5qngJ",
  title: nonEmptyString("admin todo 2"),
  createdAt: new Date(2),
  updatedAt: new Date(2),
  description: "admin todo 2",
  status: Graph.TodoStatus.Pending,
  userId: admin.id,
} as const;

export const adminTodo3 = {
  id: "Todo:c6ppdu7LgOwAPMUtAQpmW",
  title: nonEmptyString("admin todo 3"),
  createdAt: new Date(3),
  updatedAt: new Date(3),
  description: "admin todo 3",
  status: Graph.TodoStatus.Pending,
  userId: admin.id,
} as const;

export const aliceTodo = {
  id: "Todo:dL1raaT3gqDLeP8CSkX5N",
  title: nonEmptyString("alice todo"),
  createdAt: new Date(4),
  updatedAt: new Date(4),
  description: "alice todo 1",
  status: Graph.TodoStatus.Pending,
  userId: alice.id,
} as const;

export const bobTodo = {
  id: "Todo:enXlHLmZgwGeu9v0TNrFP",
  title: nonEmptyString("bob todo"),
  createdAt: new Date(5),
  updatedAt: new Date(5),
  description: "bob todo 1",
  status: Graph.TodoStatus.Pending,
  userId: bob.id,
} as const;

export const validUserIds = [admin, alice, bob].map(({ id }) => id);

export const validTodoIds = [adminTodo1, adminTodo2, adminTodo3].map(({ id }) => id);

export const validIds = [...validUserIds, ...validTodoIds];

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
