import * as postId from "../../../db/models/post/id.ts";
import { parseSomeId } from "../../common/parsers/someId.ts";

export const parsePostId = parseSomeId("Post", postId.is);

if (import.meta.vitest) {
  const { nodeId } = await import("../../common/adapters/id.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parsePostId({ id: nodeId("Post")(id) });
    expect(parsed instanceof Error).toBe(false);
  });

  test("invalid", () => {
    const parsed = parsePostId({ id: nodeId("User")(id) });
    expect(parsed instanceof Error).toBe(true);
  });
}
