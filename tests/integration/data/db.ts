import * as Prisma from "@prisma/client";

export const admin = {
  id: "a4kxogX92Wxe-kbUfDRX7",
  name: "Admin",
  role: Prisma.Role.ADMIN,
  token: "admin token",
  createdAt: new Date(0),
  updatedAt: new Date(3),
} as const;

export const alice = {
  id: "bYzHPCFPTkTPHNbCBkh8H",
  name: "Alice",
  role: Prisma.Role.USER,
  token: "alice token",
  createdAt: new Date(1),
  updatedAt: new Date(1),
} as const;

export const bob = {
  id: "cuEgH4iyoMMm6CzhWLR9S",
  name: "Bob",
  role: Prisma.Role.USER,
  token: "bob token",
  createdAt: new Date(2),
  updatedAt: new Date(2),
} as const;

export const guest = {
  id: "d9QWU0PPanh9HAWqdYRLx",
  name: "Guest",
  role: Prisma.Role.GUEST,
  token: undefined,
  createdAt: undefined,
  updatedAt: undefined,
} as const;

export const adminTodo1: Prisma.Todo = {
  id: "aHbtLGE7ANe1CSDbnhZQZ",
  title: "admin todo 1",
  createdAt: new Date(1),
  updatedAt: new Date(6),
  description: "admin todo 1",
  status: Prisma.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const adminTodo2: Prisma.Todo = {
  id: "bJKfvOLA7kyPS1DE5qngJ",
  title: "admin todo 2",
  createdAt: new Date(2),
  updatedAt: new Date(2),
  description: "admin todo 2",
  status: Prisma.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const adminTodo3: Prisma.Todo = {
  id: "c6ppdu7LgOwAPMUtAQpmW",
  title: "admin todo 3",
  createdAt: new Date(3),
  updatedAt: new Date(3),
  description: "admin todo 3",
  status: Prisma.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const aliceTodo: Prisma.Todo = {
  id: "dL1raaT3gqDLeP8CSkX5N",
  title: "alice todo",
  createdAt: new Date(4),
  updatedAt: new Date(4),
  description: "alice todo 1",
  status: Prisma.TodoStatus.PENDING,
  userId: alice.id,
} as const;

export const bobTodo: Prisma.Todo = {
  id: "enXlHLmZgwGeu9v0TNrFP",
  title: "bob todo",
  createdAt: new Date(5),
  updatedAt: new Date(5),
  description: "bob todo 1",
  status: Prisma.TodoStatus.PENDING,
  userId: bob.id,
} as const;
