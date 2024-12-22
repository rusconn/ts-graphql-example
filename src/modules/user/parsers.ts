import { nodeId } from "../common/adapters.ts";
import { parseSomeNodeId } from "../common/parsers.ts";

export const parseUserNodeId = parseSomeNodeId("User");

export const isEmail = (email: string) => {
  return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    email,
  );
};

if (import.meta.vitest) {
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
