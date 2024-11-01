import { nodeId } from "../../common/adapters.ts";
import { parseSomeNodeId } from "../../common/parsers.ts";

export const parseUserNodeId = parseSomeNodeId("User");

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  const id = "01H75CPZGG1YW9W79M7WWT6KFB";

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
