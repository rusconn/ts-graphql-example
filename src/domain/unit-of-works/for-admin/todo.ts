import type * as Domain from "../../models.ts";

export interface ITodoRepoForAdmin {
  add(todo: Domain.Todo.Type): Promise<void>;

  update(todo: Domain.Todo.Type): Promise<void>;

  remove(id: Domain.Todo.Type["id"]): Promise<void>;

  removeByUserId(userId: Domain.Todo.Type["userId"]): Promise<void>;
}
