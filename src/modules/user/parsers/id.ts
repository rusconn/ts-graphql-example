import { parseSomeNodeId } from "../../common/parsers/someNodeId.ts";

export const parseUserNodeId = parseSomeNodeId("User");

if (import.meta.vitest) {
  const { nodeId } = await import("../../common/adapters/id.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parseUserNodeId(nodeId("User")(id));
    expect(parsed instanceof Error).toBe(false);
  });

  test("invalid", () => {
    const parsed = parseUserNodeId(nodeId("Todo")(id));
    expect(parsed instanceof Error).toBe(true);
  });
}
