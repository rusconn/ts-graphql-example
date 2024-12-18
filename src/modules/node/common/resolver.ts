import type { NodeType } from "../../common/typeDefs.ts";
import type { Post } from "../../post/common/resolver.ts";
import type { User } from "../../user/common/resolver.ts";

export type Node = { type: NodeType } & (Post | User);
