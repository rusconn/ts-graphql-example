import { Role } from "@prisma/client";

import { TodoStatus } from "@/types";
import { nonEmptyString, toTodoNodeId, toUserNodeId } from "@/utils";

const SERIAL_MAX = 2 ** 31 - 1;

export const admin = {
  id: SERIAL_MAX - 100,
  name: nonEmptyString("Admin"),
  role: Role.ADMIN,
  token: nonEmptyString("admin token"),
  createdAt: new Date(0),
  updatedAt: new Date(3),
} as const;

export const alice = {
  id: admin.id + 1,
  name: nonEmptyString("Alice"),
  role: Role.USER,
  token: nonEmptyString("alice token"),
  createdAt: new Date(1),
  updatedAt: new Date(1),
} as const;

export const bob = {
  id: alice.id + 1,
  name: nonEmptyString("Bob"),
  role: Role.USER,
  token: nonEmptyString("bob token"),
  createdAt: new Date(2),
  updatedAt: new Date(2),
} as const;

export const guest = {
  id: bob.id + 1,
  name: nonEmptyString("Guest"),
  role: Role.GUEST,
  token: undefined,
  createdAt: undefined,
  updatedAt: undefined,
} as const;

export const adminTodo1 = {
  id: SERIAL_MAX - 100,
  title: nonEmptyString("admin todo 1"),
  createdAt: new Date(1),
  updatedAt: new Date(6),
  description: "admin todo 1",
  status: TodoStatus.Pending,
  userId: admin.id,
} as const;

export const adminTodo2 = {
  id: adminTodo1.id + 1,
  title: nonEmptyString("admin todo 2"),
  createdAt: new Date(2),
  updatedAt: new Date(2),
  description: "admin todo 2",
  status: TodoStatus.Pending,
  userId: admin.id,
} as const;

export const adminTodo3 = {
  id: adminTodo2.id + 1,
  title: nonEmptyString("admin todo 3"),
  createdAt: new Date(3),
  updatedAt: new Date(3),
  description: "admin todo 3",
  status: TodoStatus.Pending,
  userId: admin.id,
} as const;

export const aliceTodo = {
  id: adminTodo3.id + 1,
  title: nonEmptyString("alice todo"),
  createdAt: new Date(4),
  updatedAt: new Date(4),
  description: "alice todo 1",
  status: TodoStatus.Pending,
  userId: alice.id,
} as const;

export const bobTodo = {
  id: aliceTodo.id + 1,
  title: nonEmptyString("bob todo"),
  createdAt: new Date(5),
  updatedAt: new Date(5),
  description: "bob todo 1",
  status: TodoStatus.Pending,
  userId: bob.id,
} as const;

export const validUserNodeIds = [admin, alice, bob].map(({ id }) => toUserNodeId(id));

export const validTodoNodeIds = [adminTodo1, adminTodo2, adminTodo3].map(({ id }) =>
  toTodoNodeId(id)
);

export const validNodeIds = [...validUserNodeIds, ...validTodoNodeIds];

export const invalidUserNodeIds = [
  "User:0",
  "User:-1",
  "Usr:1",
  "User1",
  "User:a",
  "1",
  ":1",
  "1:User",
  "",
  validTodoNodeIds[0],
] as const;

export const invalidTodoNodeIds = [
  "Todo:0",
  "Todo:-1",
  "Too:1",
  "Todo1",
  "Todo:a",
  "1",
  ":1",
  "1:Todo",
  "",
  validUserNodeIds[0],
] as const;

export const invalidNodeIds = [
  ...invalidUserNodeIds.slice(0, -1),
  ...invalidTodoNodeIds.slice(0, -1),
];
