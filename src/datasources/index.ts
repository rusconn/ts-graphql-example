import { Prisma } from "@prisma/client";

export { type Todo, TodoStatus, Role, type User, PrismaClient } from "@prisma/client";

export type TodoSelectScalar = Prisma.TodoSelectScalar;
export type UserSelectScalar = Prisma.UserSelectScalar;
export type SelectScalar = TodoSelectScalar | UserSelectScalar;

export const TodoSortOrder = Prisma.SortOrder;
export const UserSortOrder = Prisma.SortOrder;

export * from "./errors";
export * from "./prisma";
