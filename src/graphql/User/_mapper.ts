import type { SetRequired } from "type-fest";

import type { User as UserModel } from "../../models/user.ts";

export type User = SetRequired<Partial<UserModel>, "id">;
