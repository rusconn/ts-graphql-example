import type { Credential, RefreshToken, Todo, User } from "../_shared/types.ts";

export type InMemoryDb = ReturnType<typeof createInMemoryDb>;

export const createInMemoryDb = () => {
  return {
    credentials: new Map<Credential["userId"], Credential>(),
    refreshTokens: new Map<RefreshToken["token"], RefreshToken>(),
    todos: new Map<Todo["id"], Todo>(),
    users: new Map<User["id"], User>(),
  };
};
