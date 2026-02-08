import type { Type as Todo } from "../../_dto/todo.ts";
import type * as UserTodoLoader from "./loaders/userTodo.ts";
import type * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import type * as UserTodosLoader from "./loaders/userTodos.ts";

export interface ITodoQueryForUser {
  find(id: Todo["id"]): Promise<Todo | undefined>;

  count(): Promise<number>;

  loadTheir(key: UserTodoLoader.Key): Promise<Todo | undefined>;

  loadTheirPage(key: UserTodosLoader.Key): Promise<Todo[]>;

  loadTheirCount(key: UserTodoCountLoader.Key): Promise<number>;
}
