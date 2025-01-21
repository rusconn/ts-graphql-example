import * as PostId from "../../../models/post/id.ts";
import { parseSomeId } from "../someId.ts";

export const parsePostId = parseSomeId("Post", PostId.is);

if (import.meta.vitest) {
  const { nodeId } = await import("../../_adapters/id.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parsePostId(nodeId("Post")(id));
    expect(parsed instanceof Error).toBe(false);
  });

  test("invalid", () => {
    const parsed = parsePostId(nodeId("User")(id));
    expect(parsed instanceof Error).toBe(true);
  });
}
