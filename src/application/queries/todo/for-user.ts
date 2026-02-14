import type { Type as Todo } from "./dto.ts";
import type * as UserTodoLoader from "./loaders/user-todo.ts";
import type * as UserTodoCountLoader from "./loaders/user-todo-count.ts";
import type * as UserTodosLoader from "./loaders/user-todos.ts";

export interface ITodoQueryForUser {
  find(id: Todo["id"]): Promise<Todo | undefined>;

  count(): Promise<number>;

  loadTheir(key: UserTodoLoader.Key): Promise<Todo | undefined>;

  loadTheirPage(key: UserTodosLoader.Key): Promise<Todo[]>;

  loadTheirCount(key: UserTodoCountLoader.Key): Promise<number>;
}
