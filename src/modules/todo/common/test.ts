import * as Prisma from "@/prisma/mod.ts";
import type * as Graph from "../../common/schema.ts";
import { dateTime } from "../../common/tests.ts";
import { db as userDB } from "../../user/common/test.ts";
import { todoNodeId, todoStatus } from "./adapter.ts";

const todoNode = (todo: Prisma.Todo): Graph.Todo => ({
  id: todoNodeId(todo.id),
  createdAt: dateTime(todo.createdAt),
  updatedAt: dateTime(todo.updatedAt),
  title: todo.title,
  description: todo.description,
  status: todoStatus(todo.status),
});

export const db = {
  adminTodo: {
    id: "01H75CR8C6PQK7Z7RE4FBY1B4M",
    createdAt: new Date(1),
    updatedAt: new Date(6),
    title: "admin todo 1",
    description: "admin todo 1",
    status: Prisma.TodoStatus.PENDING,
    userId: userDB.admin.id,
  },
  adminTodo2: {
    id: "01H75CRPCXACS8MDZFF1N5G7R9",
    createdAt: new Date(2),
    updatedAt: new Date(2),
    title: "admin todo 2",
    description: "admin todo 2",
    status: Prisma.TodoStatus.PENDING,
    userId: userDB.admin.id,
  },
  adminTodo3: {
    id: "01H75CRXV5EEDKJ731969B25TM",
    createdAt: new Date(3),
    updatedAt: new Date(3),
    title: "admin todo 3",
    description: "admin todo 3",
    status: Prisma.TodoStatus.PENDING,
    userId: userDB.admin.id,
  },
  aliceTodo: {
    id: "01H75CS32JKXAK95KMDCA3PV1Z",
    createdAt: new Date(4),
    updatedAt: new Date(4),
    title: "alice todo",
    description: "alice todo 1",
    status: Prisma.TodoStatus.PENDING,
    userId: userDB.alice.id,
  },
} as const;

export const graph = {
  adminTodo: todoNode(db.adminTodo),
  adminTodo2: todoNode(db.adminTodo2),
  adminTodo3: todoNode(db.adminTodo3),
  aliceTodo: todoNode(db.aliceTodo),
};

export const validTodoIds = [graph.adminTodo, graph.adminTodo2, graph.adminTodo3].map(t => t.id);

export const invalidTodoIds = [
  "Too:01H75CR8C6PQK7Z7RE4FBY1B4M",
  "Todo01H75CR8C6PQK7Z7RE4FBY1B4M",
  "01H75CR8C6PQK7Z7RE4FBY1B4M",
  ":01H75CR8C6PQK7Z7RE4FBY1B4M",
  "01H75CR8C6PQK7Z7RE4FBY1B4M:Todo",
  "",
  "User:01H75CPZGG1YW9W79M7WWT6KFB",
] as const;
