import type { ResolversParentTypes } from "../../_schema.ts";

export type ParentTodo = Pick<ResolversParentTypes["Todo"], "userId">;
