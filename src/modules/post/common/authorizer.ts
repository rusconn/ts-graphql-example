import { type AuthContext, authErr } from "../../common/authorizers.ts";
import type { Post } from "./resolver.ts";

type AuthPost = Pick<Post, "userId">;

export const authPostOwner = (context: AuthContext, post: AuthPost) => {
  if (context.user?.id === post.userId) return context.user;
  throw authErr();
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");
  const { db } = await import("../../common/testData/db.ts");
  const { context } = await import("../../common/testData/context.ts");

  describe("authPostOwner", () => {
    const allows = [
      [context.alice, db.alicePost1],
      [context.bob, db.bobPost1],
    ] as const;

    const denies = [
      [context.alice, db.bobPost1],
      [context.bob, db.alicePost1],
      [context.guest, db.alicePost1],
      [context.guest, db.bobPost1],
    ] as const;

    test.each(allows)("allows %#", (contextUser, post) => {
      authPostOwner({ user: contextUser }, post);
    });

    test.each(denies)("denies %#", (contextUser, post) => {
      expect.assertions(1);
      try {
        authPostOwner({ user: contextUser }, post);
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
