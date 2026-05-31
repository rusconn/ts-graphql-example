import type { Todo } from "../../../../domain/entities.ts";
import type { ContextForAuthed } from "../../yoga/context.ts";

export async function getNode(ctx: ContextForAuthed, id: Todo.Type["id"]) {
  return await ctx.queries.todo.find(id);
}
