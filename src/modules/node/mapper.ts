import type { NodeType } from "../common/adapters/id.ts";
import type { Post } from "../post/mapper.ts";
import type { User } from "../user/mapper.ts";

export type Node = { type: NodeType } & (Post | User);
