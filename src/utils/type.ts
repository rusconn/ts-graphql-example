import type { DateTime, NonEmptyString, PositiveInt } from "@/types";

export function dateTime(x: string): DateTime {
  if (!isDateTime(x)) {
    throw new TypeError(`invalid value passed: ${x}`);
  }
  return x;
}

export const isDateTime = (x: string): x is DateTime => {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(x);
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

export function positiveInt(x: number): PositiveInt {
  if (!isPositiveInt(x)) {
    throw new TypeError(`invalid value passed: ${x}`);
  }
  return x;
}

export const isPositiveInt = (x: number): x is PositiveInt => {
  return x > 0;
};
