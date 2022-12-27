import { prisma } from "it/prisma";

// Promise.all() だとたまにデッドロックが発生するので直列実行
export const clearTables = async () => {
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();
};
