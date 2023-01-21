import type { Scalar } from "@/graphql/types";

export function dateTime(x: string): Scalar.DateTime {
  if (!isDateTime(x)) {
    throw new TypeError(`invalid value passed: ${x}`);
  }
  return x;
}

export const isDateTime = (x: string): x is Scalar.DateTime => {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(x);
};

export function nonEmptyString(x: string): Scalar.NonEmptyString {
  if (!isNonEmptyString(x)) {
    throw new TypeError(`invalid value passed: ${x}`);
  }
  return x;
}

export const isNonEmptyString = (x: string): x is Scalar.NonEmptyString => {
  return x.length !== 0;
};
