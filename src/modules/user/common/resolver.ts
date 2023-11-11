import type * as Prisma from "@/prisma";
import type { Full } from "../../common/resolvers";

export type User = Pick<Prisma.User, "id"> | Full<Prisma.User>;
