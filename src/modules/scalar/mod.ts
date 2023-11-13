import type { Resolvers } from "../common/schema.js";
import * as DateTime from "./DateTime.js";
import * as EmailAddress from "./EmailAddress.js";
import * as NonEmptyString from "./NonEmptyString.js";

export const typeDefs = [DateTime.typeDef, EmailAddress.typeDef, NonEmptyString.typeDef];

export const resolvers: Resolvers = {
  DateTime: DateTime.resolver,
  EmailAddress: EmailAddress.resolver,
  NonEmptyString: NonEmptyString.resolver,
};

export type { DateTime } from "./DateTime.js";
export type { EmailAddress } from "./EmailAddress.js";
export type { NonEmptyString } from "./NonEmptyString.js";

export type { ID } from "./ID.js";
