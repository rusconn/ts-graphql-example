import type { Newtype } from "@/generic/types";

export type DateTime = Newtype<"DateTime", string>;
export type EmailAddress = Newtype<"EmailAddress", string>;
export type NonEmptyString = Newtype<"NonEmptyString", string>;

export function dateTime(x: string): DateTime {
  if (!isDateTime(x)) {
    throw new TypeError(`invalid value passed: ${x}`);
  }
  return x;
}

export const isDateTime = (x: string): x is DateTime => {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(x);
};

export function emailAddress(x: string): EmailAddress {
  if (!isEmailAddress(x)) {
    throw new TypeError(`invalid value passed: ${x}`);
  }
  return x;
}

export const isEmailAddress = (x: string): x is EmailAddress => {
  return /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/.test(x);
};

export function nonEmptyString(x: string): NonEmptyString {
  if (!isNonEmptyString(x)) {
    throw new TypeError(`invalid value passed: ${x}`);
  }
  return x;
}

export const isNonEmptyString = (x: string): x is NonEmptyString => {
  return x.length !== 0;
};
