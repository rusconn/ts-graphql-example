import { EmailAddressResolver, EmailAddressTypeDefinition } from "graphql-scalars";

import type { EmailAddress as Email } from "../../lib/string/emailAddress.ts";

export type EmailAddress = Email;

export const typeDef = EmailAddressTypeDefinition;

export const resolver = EmailAddressResolver;
