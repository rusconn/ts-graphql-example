import { sign } from "../../../src/presentation/_shared/auth/access-token.ts";
import { domain } from "../../../src/presentation/graphql/schema/_test/data.ts";

export const tokens = {
  admin: await sign(domain.users.admin),
  alice: await sign(domain.users.alice),
};
