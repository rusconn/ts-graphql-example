import type { Resolvers } from "../../schema.ts";
import * as DateTime from "./DateTime.ts";
import * as EmailAddress from "./EmailAddress.ts";
import * as NonEmptyString from "./NonEmptyString.ts";

export const typeDefs = [DateTime.typeDef, EmailAddress.typeDef, NonEmptyString.typeDef];

export const resolvers: Resolvers = {
  DateTime: DateTime.resolver,
  EmailAddress: EmailAddress.resolver,
  NonEmptyString: NonEmptyString.resolver,
};

export type { DateTime } from "./DateTime.ts";
export type { EmailAddress } from "./EmailAddress.ts";
export type { NonEmptyString } from "./NonEmptyString.ts";

export type { ID } from "./ID.ts";
