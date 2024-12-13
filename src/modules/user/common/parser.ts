import { nodeId } from "../../common/adapters.ts";
import { parseSomeNodeId } from "../../common/parsers.ts";

export const parseUserNodeId = parseSomeNodeId("User");

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    parseUserNodeId(nodeId("User")(id));
  });

  test("invalid", () => {
    expect.assertions(1);
    try {
      parseUserNodeId(nodeId("Todo")(id));
    } catch (e) {
      expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
    }
  });
}
