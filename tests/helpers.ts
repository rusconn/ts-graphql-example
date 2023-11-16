import { prisma } from "@/prisma/mod.ts";

export const clearTables = async () => {
  // CASCADE Todo
  await clearUsers();
};

export const clearTodos = async () => {
  await prisma.todo.deleteMany();
};

export const clearUsers = async () => {
  await prisma.user.deleteMany();
};

export function fail(): never {
  throw new Error();
}
