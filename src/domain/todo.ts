import * as TodoId from "./todo/id.ts";
import type { User } from "./user.ts";

export { TodoId };

export type Todo = {
  id: TodoId.TodoId;
  title: string;
  description: string;
  status: TodoStatus;
  userId: User["id"];
  createdAt: Date;
  updatedAt: Date;
};

export const TodoStatus = {
  DONE: "DONE",
  PENDING: "PENDING",
} as const;

export type TodoStatus = (typeof TodoStatus)[keyof typeof TodoStatus];
