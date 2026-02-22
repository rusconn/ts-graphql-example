import type { NodeType } from "../Node/id.ts";
import type { Todo } from "../Todo/_mapper.ts";
import type { User } from "../User/_mapper.ts";

export type Node = { _type: NodeType } & (Todo | User);
