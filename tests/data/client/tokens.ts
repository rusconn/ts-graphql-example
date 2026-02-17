import { signedJwt } from "../../../src/util/access-token.ts";

import { domain } from "../../../src/graphql/_test/data.ts";

export const tokens = {
  admin: await signedJwt(domain.users.admin),
  alice: await signedJwt(domain.users.alice),
};
