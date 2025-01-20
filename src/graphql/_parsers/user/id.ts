import * as userId from "../../../db/models/user/id.ts";
import { parseSomeId } from "../someId.ts";

export const parseUserId = parseSomeId("User", userId.is);

if (import.meta.vitest) {
  const { nodeId } = await import("../../_adapters/id.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parseUserId({ id: nodeId("User")(id) });
    expect(parsed instanceof Error).toBe(false);
  });

  test("invalid", () => {
    const parsed = parseUserId({ id: nodeId("Todo")(id) });
    expect(parsed instanceof Error).toBe(true);
  });
}
