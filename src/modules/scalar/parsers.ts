import type { Newtype } from "@/generic/types";

export type DateTime = Newtype<"DateTime", string>;
export type EmailAddress = Newtype<"EmailAddress", string>;
export type NonEmptyString = Newtype<"NonEmptyString", string>;
