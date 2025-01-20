import type { Todo } from "../Todo/_mapper.ts";
import type { User } from "../User/_mapper.ts";
import type { NodeType } from "../_adapters/id.ts";

export type Node = { type: NodeType } & (Todo | User);
