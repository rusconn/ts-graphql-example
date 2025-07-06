import type { NodeType } from "../_adapters/id.ts";
import type { Todo } from "../Todo/_mapper.ts";
import type { User } from "../User/_mapper.ts";

export type Node = { type: NodeType } & (Todo | User);
