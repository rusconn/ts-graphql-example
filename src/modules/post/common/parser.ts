import { nodeId } from "../../common/adapters.ts";
import { parseSomeNodeId } from "../../common/parsers.ts";

export const parsePostNodeId = parseSomeNodeId("Post");

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    parsePostNodeId(nodeId("Post")(id));
  });

  test("invalid", () => {
    expect.assertions(1);
    try {
      parsePostNodeId(nodeId("User")(id));
    } catch (e) {
      expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
    }
  });
}
