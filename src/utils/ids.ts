import { nanoid } from "nanoid";

import type { NodeType } from "@/types";
import { BaseError } from "@/errors";
import { isValidNodeType } from "./type";

const sep = ":";

const genId = (type: NodeType) => `${type}${sep}${nanoid()}`;

export const todoId = () => genId("Todo");
export const userId = () => genId("User");

/**
 * for node interface
 * @param id `"{Type}:{nanoId}"`
 * @throws BaseError - if param is invalid
 */
export const fromId = (id: string) => {
  // nanoid は ":" を含まない
  const [maybeType, maybeNanoId] = id.split(sep);

  if (!isValidNodeType(maybeType)) {
    throw new BaseError("invalid input");
  }

  if (maybeNanoId == null || maybeNanoId === "") {
    throw new BaseError("invalid input");
  }

  return { type: maybeType, nanoId: maybeNanoId };
};

const assertIsSpecifiedId = (types: NodeType[]) => (x: string) => {
  // nanoid は ":" を含まない
  const [maybeType, maybeNanoId] = x.split(sep);

  if (!isValidNodeType(maybeType)) {
    throw new BaseError("invalid input");
  }

  if (!types.includes(maybeType)) {
    throw new BaseError("invalid input");
  }

  if (maybeNanoId == null || maybeNanoId === "") {
    throw new BaseError("invalid input");
  }
};

export const assertIsId = (x: string) => assertIsSpecifiedId(["User", "Todo"])(x);
export const assertIsUserId = (x: string) => assertIsSpecifiedId(["User"])(x);
export const assertIsTodoId = (x: string) => assertIsSpecifiedId(["Todo"])(x);
