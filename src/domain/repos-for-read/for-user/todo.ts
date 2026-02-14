import type * as Domain from "../../entities.ts";

export interface ITodoReaderRepoForUser {
  find(id: Domain.Todo.Type["id"]): Promise<Domain.Todo.Type | undefined>;
}
