import type { NodeType } from "../../common/typeDefs.ts";
import type { Todo } from "../../todo/common/resolver.ts";
import type { User } from "../../user/common/resolver.ts";

export type Node = { type: NodeType } & (Todo | User);
