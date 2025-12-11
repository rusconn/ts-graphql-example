import * as Db from "../../db/types.ts";
import * as Domain from "../../domain/user.ts";

export const mappers = {
  toDb(status: Domain.User["role"]): Db.User["role"] {
    return domainDbMap[status];
  },
  toDomain(status: Db.User["role"]): Domain.User["role"] {
    return dbDomainMap[status];
  },
};

const domainDbMap = {
  [Domain.UserRole.ADMIN]: Db.UserRole.Admin,
  [Domain.UserRole.USER]: Db.UserRole.User,
} satisfies Record<Domain.User["role"], Db.User["role"]>;

const dbDomainMap = {
  [Db.UserRole.Admin]: Domain.UserRole.ADMIN,
  [Db.UserRole.User]: Domain.UserRole.USER,
} satisfies Record<Db.User["role"], Domain.User["role"]>;
