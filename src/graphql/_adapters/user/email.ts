import type * as Db from "../../../db/types.ts";
import * as EmailAddress from "../../../lib/string/emailAddress.ts";
import type * as Graph from "../../../schema.ts";

export const userEmail = (email: Db.User["email"]): NonNullable<Graph.User["email"]> | Error => {
  return EmailAddress.is(email) ? email : new Error("invalid email");
};
