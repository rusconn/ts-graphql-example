import { TodoId } from "../../../domain/todo.ts";
import { parseSomeId } from "../someId.ts";

export const parseTodoId = parseSomeId("Todo", TodoId.is);

if (import.meta.vitest) {
  const { nodeId } = await import("../../_adapters/id.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parseTodoId(nodeId("Todo")(id));
    expect(Error.isError(parsed)).toBe(false);
  });

  test("invalid", () => {
    const parsed = parseTodoId(nodeId("User")(id));
    expect(Error.isError(parsed)).toBe(true);
  });
}
