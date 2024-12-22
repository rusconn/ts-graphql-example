import { nodeId } from "../common/adapters.ts";
import { parseSomeNodeId } from "../common/parsers.ts";

export const parseTodoNodeId = parseSomeNodeId("Todo");

if (import.meta.vitest) {
  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parseTodoNodeId(nodeId("Todo")(id));
    expect(parsed instanceof Error).toBe(false);
  });

  test("invalid", () => {
    const parsed = parseTodoNodeId(nodeId("User")(id));
    expect(parsed instanceof Error).toBe(true);
  });
}
