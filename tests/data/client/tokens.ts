import { signedJwt } from "../../../src/util/accessToken.ts";

import { domain } from "../domain/users.ts";

export const tokens = {
  admin: await signedJwt(domain.admin),
  alice: await signedJwt(domain.alice),
};
