import type { Merge } from "ts-essentials";
import type * as Prisma from "@prisma/client";

type DbID = { id: number };
type NodeID = { id: string };

type ResolverModel<T extends DbID> = Merge<T, NodeID>;

export type ResolverTodo = ResolverModel<Prisma.Todo>;
export type ResolverUser = ResolverModel<Prisma.User>;
