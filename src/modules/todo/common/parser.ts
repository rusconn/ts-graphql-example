import { nodeId } from "../../common/adapters.ts";
import { parseSomeNodeId } from "../../common/parsers.ts";

export const parseTodoNodeId = parseSomeNodeId("Todo");

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");

  const id = "01H75CPZGG1YW9W79M7WWT6KFB";

  test("valid", () => {
    parseTodoNodeId(nodeId("Todo")(id));
  });

  test("invalid", () => {
    expect.assertions(1);
    try {
      parseTodoNodeId(nodeId("User")(id));
    } catch (e) {
      expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
    }
  });
}
