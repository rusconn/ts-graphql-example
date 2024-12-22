import type { ResolversParentTypes } from "../../../schema.ts";

export type ParentTodo = Pick<ResolversParentTypes["Todo"], "userId">;
