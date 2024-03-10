// prisma-kysely が生成する型が足りないので用意した
// TODO: 下記プルリクがマージされたらこのファイルは不要になるので消す
// https://github.com/valtyr/prisma-kysely/pull/85

import type { Selectable } from "kysely";

import type { Todo, User } from "./types.ts";

export type TodoSelect = Selectable<Todo>;
export type UserSelect = Selectable<User>;
