import { Todo, TodoStatus, Role, User, Prisma } from "@prisma/client";

export * from "./errors";
export * from "./prisma";

const { SortOrder } = Prisma;
export { type Todo, TodoStatus };
export { Role, type User };
export const TodoSortOrder = SortOrder;
export const UserSortOrder = SortOrder;
