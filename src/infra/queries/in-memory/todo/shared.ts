import * as Dto from "../../../../application/queries/dto.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import * as UserTodoLoader from "./loaders/userTodo.ts";
import * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import * as UserTodosLoader from "./loaders/userTodos.ts";

export class TodoQueryShared {
  #db;
  #loaders;
  #tenantId;

  constructor(db: InMemoryDb, tenantId?: Domain.Todo.Type["userId"]) {
    this.#db = db;
    this.#loaders = {
      userTodo: UserTodoLoader.create(db, tenantId),
      userTodos: UserTodosLoader.create(db, tenantId),
      userTodoCount: UserTodoCountLoader.create(db, tenantId),
    };
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Todo.Type["id"]) {
    const todo = this.#db.todos.get(id);
    if (!todo) {
      return undefined;
    }

    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      return undefined;
    }

    return todo && Dto.Todo.parseOrThrow(todo);
  }

  async count() {
    const todos = this.#db.todos.values().toArray();

    return this.#tenantId != null
      ? todos.filter((todo) => todo.userId === this.#tenantId).length
      : todos.length;
  }

  async loadTheir(key: UserTodoLoader.Key) {
    const todo = await this.#loaders.userTodo.load(key);
    return todo && Dto.Todo.parseOrThrow(todo);
  }

  async loadTheirPage(key: UserTodosLoader.Key) {
    const todos = await this.#loaders.userTodos.load(key);
    return todos.map(Dto.Todo.parseOrThrow);
  }

  async loadTheirCount(key: UserTodoCountLoader.Key) {
    return await this.#loaders.userTodoCount.load(key);
  }
}
