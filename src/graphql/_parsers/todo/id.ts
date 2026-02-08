import { Todo } from "../../../domain/models.ts";
import { parseSomeId } from "../someId.ts";

export const parseTodoId = parseSomeId("Todo", Todo.Id.is);

if (import.meta.vitest) {
  const { nodeId } = await import("../../Node/id.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parseTodoId(nodeId("Todo")(id));
    expect(parsed.isOk()).toBe(true);
  });

  test("invalid", () => {
    const parsed = parseTodoId(nodeId("User")(id));
    expect(parsed.isErr()).toBe(true);
  });
}
