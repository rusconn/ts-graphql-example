import type * as Prisma from "@/prisma/mod.js";
import type { Full } from "../../common/resolvers.js";

export type User = Pick<Prisma.User, "id"> | Full<Prisma.User>;
