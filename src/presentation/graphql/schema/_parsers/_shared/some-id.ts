import { err, ok, type Result } from "neverthrow";

import type { Scalars } from "../../_types.ts";
import type { NodeType } from "../../Node/id.ts";
import { parseId } from "../id.ts";

export const parseSomeId = <T extends NodeType, U extends string>(
  nodeType: T,
  isInternalId: (input: string) => input is U,
) => {
  return (id: Scalars["ID"]["input"]): Result<U, Error> =>
    parseId(id).andThen(({ type, internalId }) =>
      type !== nodeType || !isInternalId(internalId)
        ? err(new Error(`Invalid global id '${id}'`))
        : ok(internalId),
    );
};
