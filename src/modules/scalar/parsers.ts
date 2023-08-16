import type { Opaque } from "type-fest";

export type DateTime = Opaque<string, "DateTime">;
export type EmailAddress = Opaque<string, "EmailAddress">;
export type NonEmptyString = Opaque<string, "NonEmptyString">;
