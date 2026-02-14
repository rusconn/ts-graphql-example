import type * as Domain from "../../entities.ts";

export interface ITodoReaderRepoForAdmin {
  find(id: Domain.Todo.Type["id"]): Promise<Domain.Todo.Type | undefined>;
}
