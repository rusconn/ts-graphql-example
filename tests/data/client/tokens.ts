import { signedJwt } from "../../../src/util/access-token.ts";

import { domain } from "../../../src/graphql/_test/data/domain/users.ts";

export const tokens = {
  admin: await signedJwt(domain.admin),
  alice: await signedJwt(domain.alice),
};
