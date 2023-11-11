import type { Resolvers } from "../common/schema";
import * as DateTime from "./DateTime";
import * as EmailAddress from "./EmailAddress";
import * as NonEmptyString from "./NonEmptyString";

export const typeDefs = [DateTime.typeDef, EmailAddress.typeDef, NonEmptyString.typeDef];

export const resolvers: Resolvers = {
  DateTime: DateTime.resolver,
  EmailAddress: EmailAddress.resolver,
  NonEmptyString: NonEmptyString.resolver,
};

export type { DateTime } from "./DateTime";
export type { EmailAddress } from "./EmailAddress";
export type { NonEmptyString } from "./NonEmptyString";

export type { ID } from "./ID";
