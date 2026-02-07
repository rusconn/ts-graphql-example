import { UserId } from "../../../domain/user.ts";
import { parseSomeId } from "../someId.ts";

export const parseUserId = parseSomeId("User", UserId.is);

if (import.meta.vitest) {
  const { nodeId } = await import("../../Node/id.ts");

  const id = "0193cb3e-4379-750f-880f-77afae342259";

  test("valid", () => {
    const parsed = parseUserId(nodeId("User")(id));
    expect(Error.isError(parsed)).toBe(false);
  });

  test("invalid", () => {
    const parsed = parseUserId(nodeId("Todo")(id));
    expect(Error.isError(parsed)).toBe(true);
  });
}
