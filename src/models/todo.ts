import type { TodoStatus } from "../db/types.ts";
import * as TodoId from "./todo/id.ts";
import type { User } from "./user.ts";

export { TodoId };

export type Todo = {
  id: TodoId.TodoId;
  title: string;
  description: string;
  status: TodoStatus;
  updatedAt: Date;
  userId: User["id"];
};
