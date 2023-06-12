import { prisma } from "./datasources";

// Promise.all() だとたまにデッドロックが発生するので直列実行
export const clearTables = async () => {
  await clearTodos();
  await clearUsers();
};

export const clearTodos = async () => {
  await prisma.todo.deleteMany();
};

export const clearUsers = async () => {
  await prisma.user.deleteMany();
};
