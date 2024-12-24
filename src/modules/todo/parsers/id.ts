import * as todoId from "../../../db/models/todo/id.ts";
import { parseSomeId } from "../../common/parsers/someId.ts";

export const parseTodoId = parseSomeId("Todo", todoId.is);

if (import.meta.vitest) {
  const { nodeId } = await import("../../common/adapters/id.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parseTodoId({ id: nodeId("Todo")(id) });
    expect(parsed instanceof Error).toBe(false);
  });

  test("invalid", () => {
    const parsed = parseTodoId({ id: nodeId("User")(id) });
    expect(parsed instanceof Error).toBe(true);
  });
}
