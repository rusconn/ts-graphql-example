import type * as Domain from "../../models.ts";

export interface ITodoReaderRepoForUser {
  find(id: Domain.Todo.Type["id"]): Promise<Domain.Todo.Type | undefined>;
}
