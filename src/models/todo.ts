import type { TodoId } from "./todo/id.ts";
import type { User } from "./user.ts";

export type Todo = {
  id: TodoId;
  title: string;
  description: string;
  status: "DONE" | "PENDING";
  updatedAt: Date;
  userId: User["id"];
};
