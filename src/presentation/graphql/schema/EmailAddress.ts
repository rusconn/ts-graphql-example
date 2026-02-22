import { EmailAddressResolver, EmailAddressTypeDefinition } from "graphql-scalars";

export type { EmailAddress } from "../../../util/email-address.ts";

export const typeDef = EmailAddressTypeDefinition;

export const resolver = EmailAddressResolver;
