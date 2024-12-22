import type { NodeType } from "../common/adapters/id.ts";
import type { Todo } from "../todo/mapper.ts";
import type { User } from "../user/mapper.ts";

export type Node = { type: NodeType } & (Todo | User);
