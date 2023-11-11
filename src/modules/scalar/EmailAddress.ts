import { EmailAddressResolver, EmailAddressTypeDefinition } from "graphql-scalars";
import type { Opaque } from "type-fest";

export type EmailAddress = Opaque<string, "EmailAddress">;

export const typeDef = EmailAddressTypeDefinition;

export const resolver = EmailAddressResolver;
