import { nanoid } from "nanoid";

import type { NodeType } from "@/types";

const sep = ":";

const genId = (type: NodeType) => `${type}${sep}${nanoid()}`;

export const todoId = () => genId("Todo");
export const userId = () => genId("User");

const isSpecifiedId = (type: NodeType) => (x: string) => {
  const [maybeType, maybeNanoId, ...rest] = x.split(sep);
  return maybeType === type && maybeNanoId != null && maybeNanoId !== "" && rest.length === 0;
};

export const isId = (x: string) => [isUserId, isTodoId].some(f => f(x));
export const isTodoId = isSpecifiedId("Todo");
export const isUserId = isSpecifiedId("User");
