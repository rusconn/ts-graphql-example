import { todoAPI, userAPI } from "./datasources";

// Promise.all() だとたまにデッドロックが発生するので直列実行
export const clearTables = async () => {
  await todoAPI.deleteAll();
  await userAPI.deleteAll();
};
