import { describe, test, expect } from "vitest";

import { validNodeIds, invalidIds } from "tests/data/graph";
import { ParseError as ParseErr } from "../common/parsers";
import { parsers as parse } from "./parsers";

describe("Query.node", () => {
  test.each(validNodeIds)("%s", id => {
    expect(() => parse.Query.node({ id })).not.toThrow(ParseErr);
  });

  test.each(invalidIds)("%s", id => {
    expect(() => parse.Query.node({ id })).toThrow(ParseErr);
  });
});
