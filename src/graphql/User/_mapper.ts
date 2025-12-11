import type { SetRequired } from "type-fest";

import type * as Dto from "../../dto/user-base.ts";

export type User = SetRequired<Partial<Dto.UserBase>, "id">;
