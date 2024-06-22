import * as DB from "@/db/mod.ts";
import { db as users } from "./user.ts";

export const db = {
  adminTodo: {
    /** Date: 2023-08-06T12:22:02.886Z */
    id: "01H75CR8C6PQK7Z7RE4FBY1B4M",
    updatedAt: new Date("2023-08-06T12:22:36.000Z"),
    title: "admin todo 1",
    description: "admin todo 1",
    status: DB.TodoStatus.PENDING,
    userId: users.admin.id,
  },
  adminTodo2: {
    /** Date: 2023-08-06T12:22:17.245Z */
    id: "01H75CRPCXACS8MDZFF1N5G7R9",
    updatedAt: new Date("2023-08-06T12:22:17.245Z"),
    title: "admin todo 2",
    description: "admin todo 2",
    status: DB.TodoStatus.DONE,
    userId: users.admin.id,
  },
  adminTodo3: {
    /** Date: 2023-08-06T12:22:24.869Z */
    id: "01H75CRXV5EEDKJ731969B25TM",
    updatedAt: new Date("2023-08-06T12:22:24.869Z"),
    title: "admin todo 3",
    description: "admin todo 3",
    status: DB.TodoStatus.PENDING,
    userId: users.admin.id,
  },
  aliceTodo: {
    /** Date: 2023-08-06T12:22:30.226Z */
    id: "01H75CS32JKXAK95KMDCA3PV1Z",
    updatedAt: new Date("2023-08-06T12:22:30.226Z"),
    title: "alice todo",
    description: "alice todo 1",
    status: DB.TodoStatus.PENDING,
    userId: users.alice.id,
  },
} as const;
