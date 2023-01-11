import * as Prisma from "@prisma/client";

import { Role } from "@/types";
import type * as Mapper from "@/types/mappers";
import { nonEmptyString } from "@/utils";
import { toSchemaConnections } from "./utils";

export const toSchemaUser = (user: Prisma.User): Mapper.User => ({
  ...user,
  name: nonEmptyString(user.name),
  token: nonEmptyString(user.token),
  role: {
    [Prisma.Role.ADMIN]: Role.Admin,
    [Prisma.Role.USER]: Role.User,
    [Prisma.Role.GUEST]: Role.Guest,
  }[user.role],
});

export const toSchemaUsers = toSchemaConnections(toSchemaUser);
