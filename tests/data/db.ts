import * as Prisma from "@/prisma/mod.js";

export const admin: Prisma.User = {
  id: "01H75CPZGG1YW9W79M7WWT6KFB",
  createdAt: new Date(0),
  updatedAt: new Date(2),
  name: "Admin",
  email: "admin@admin.com",
  /** raw: adminadmin */
  password: "$2b$04$aIswdZ6eFo8qQTheMa8x1.s2sd7I9uZr.vUkGwl9OylshNLCMqH8i",
  role: Prisma.Role.ADMIN,
  token: "01H77AB3NYGD7B1N3XRPKD8JTN",
} as const;

export const alice: Prisma.User = {
  id: "01H75CPZV2VWQPCXTBKXCQ50A2",
  createdAt: new Date(1),
  updatedAt: new Date(1),
  name: "Alice",
  email: "alice@alice.com",
  /** raw: alicealice */
  password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
  role: Prisma.Role.USER,
  token: "01H77ABA8TDGSQ2XJVV57A0BEV",
} as const;

export const adminTodo1: Prisma.Todo = {
  id: "01H75CR8C6PQK7Z7RE4FBY1B4M",
  createdAt: new Date(1),
  updatedAt: new Date(6),
  title: "admin todo 1",
  description: "admin todo 1",
  status: Prisma.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const adminTodo2: Prisma.Todo = {
  id: "01H75CRPCXACS8MDZFF1N5G7R9",
  createdAt: new Date(2),
  updatedAt: new Date(2),
  title: "admin todo 2",
  description: "admin todo 2",
  status: Prisma.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const adminTodo3: Prisma.Todo = {
  id: "01H75CRXV5EEDKJ731969B25TM",
  createdAt: new Date(3),
  updatedAt: new Date(3),
  title: "admin todo 3",
  description: "admin todo 3",
  status: Prisma.TodoStatus.PENDING,
  userId: admin.id,
} as const;

export const aliceTodo: Prisma.Todo = {
  id: "01H75CS32JKXAK95KMDCA3PV1Z",
  createdAt: new Date(4),
  updatedAt: new Date(4),
  title: "alice todo",
  description: "alice todo 1",
  status: Prisma.TodoStatus.PENDING,
  userId: alice.id,
} as const;
