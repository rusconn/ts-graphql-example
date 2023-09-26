import { Prisma } from "@prisma/client";

export { type Todo, TodoStatus, Role, type User, PrismaClient } from "@prisma/client";

export const TodoSortOrder = Prisma.SortOrder;
export const UserSortOrder = Prisma.SortOrder;

export * from "./errors";
export * from "./prisma";
