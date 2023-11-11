import type * as Prisma from "@/prisma";
import type { Full } from "../../common/resolvers";

export type Todo =
  | (Pick<Prisma.Todo, "id"> & Partial<Pick<Prisma.Todo, "userId">>)
  | Full<Prisma.Todo>;
