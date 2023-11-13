import type * as Prisma from "@/prisma/mod.js";
import type { Full } from "../../common/resolvers.js";

export type Todo =
  | (Pick<Prisma.Todo, "id"> & Partial<Pick<Prisma.Todo, "userId">>)
  | Full<Prisma.Todo>;
