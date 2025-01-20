import type { NodeType } from "../../common/adapters/id.ts";
import type { Todo } from "../../todo/Todo/_mapper.ts";
import type { User } from "../../user/User/_mapper.ts";

export type Node = { type: NodeType } & (Todo | User);
