import { TodoStatus } from "../../../db/generated/types.ts";
import type { Todo } from "../../Todo/_mapper.ts";
import { db as users } from "./user.ts";

export const db = {
  adminTodo: {
    /** Date: 2024-12-15T17:43:22.415Z */
    id: "0193cb6a-ec2f-70ad-9b08-8086c43b2d17",
    updatedAt: new Date("2024-12-15T17:43:50.654Z"),
    title: "admin todo 1",
    description: "admin todo 1",
    status: TodoStatus.PENDING,
    userId: users.admin.id,
  } as Todo,
  adminTodo2: {
    /** Date: 2024-12-15T17:43:30.901Z */
    id: "0193cb6b-0d55-711b-a11b-6eb96871a3a7",
    updatedAt: new Date("2024-12-15T17:43:30.901Z"),
    title: "admin todo 2",
    description: "admin todo 2",
    status: TodoStatus.DONE,
    userId: users.admin.id,
  } as Todo,
  adminTodo3: {
    /** Date: 2024-12-15T17:43:41.742Z */
    id: "0193cb6b-37ae-716b-b774-a3c81db18659",
    updatedAt: new Date("2024-12-15T17:43:41.742Z"),
    title: "admin todo 3",
    description: "admin todo 3",
    status: TodoStatus.PENDING,
    userId: users.admin.id,
  } as Todo,
  aliceTodo: {
    /** Date: 2024-12-15T17:43:49.654Z */
    id: "0193cb6b-5696-7022-bc97-98ecd41d1957",
    updatedAt: new Date("2024-12-15T17:43:49.654Z"),
    title: "alice todo",
    description: "alice todo 1",
    status: TodoStatus.PENDING,
    userId: users.alice.id,
  } as Todo,
};
