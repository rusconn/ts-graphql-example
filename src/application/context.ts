import type { OverrideProperties } from "type-fest";

import type { IRefreshTokenReaderRepo } from "../domain/repositories-read/refresh-token/shared.ts";
import type { ITodoReaderRepoForAdmin } from "../domain/repositories-read/todo/for-admin.ts";
import type { ITodoReaderRepoForUser } from "../domain/repositories-read/todo/for-user.ts";
import type { IUserReaderRepoForAdmin } from "../domain/repositories-read/user/for-admin.ts";
import type { IUserReaderRepoForGuest } from "../domain/repositories-read/user/for-guest.ts";
import type { IUserReaderRepoForUser } from "../domain/repositories-read/user/for-user.ts";
import * as Dto from "./dto.ts";
import type { ITodoQueryForAdmin } from "./queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "./queries/todo/for-user.ts";
import type { IUserQueryForAdmin } from "./queries/user/for-admin.ts";
import type { IUserQueryForUser } from "./queries/user/for-user.ts";
import type { IUnitOfWorkForAdmin } from "./unit-of-works/for-admin.ts";
import type { IUnitOfWorkForGuest } from "./unit-of-works/for-guest.ts";
import type { IUnitOfWorkForUser } from "./unit-of-works/for-user.ts";

export type AppContext = AppContextForAdmin | AppContextForUser | AppContextForGuest;
export type AppContextForAuthed = AppContextForAdmin | AppContextForUser;

export type AppContextForAdmin = {
  role: "ADMIN";
  user: OverrideProperties<Dto.User.Type, { role: "ADMIN" }>;
  queries: {
    todo: ITodoQueryForAdmin;
    user: IUserQueryForAdmin;
  };
  repos: {
    refreshToken: IRefreshTokenReaderRepo;
    todo: ITodoReaderRepoForAdmin;
    user: IUserReaderRepoForAdmin;
  };
  unitOfWork: IUnitOfWorkForAdmin;
};

export type AppContextForUser = {
  role: "USER";
  user: OverrideProperties<Dto.User.Type, { role: "USER" }>;
  queries: {
    todo: ITodoQueryForUser;
    user: IUserQueryForUser;
  };
  repos: {
    refreshToken: IRefreshTokenReaderRepo;
    todo: ITodoReaderRepoForUser;
    user: IUserReaderRepoForUser;
  };
  unitOfWork: IUnitOfWorkForUser;
};

export type AppContextForGuest = {
  role: "GUEST";
  user: null;
  repos: {
    refreshToken: IRefreshTokenReaderRepo;
    user: IUserReaderRepoForGuest;
  };
  unitOfWork: IUnitOfWorkForGuest;
};
