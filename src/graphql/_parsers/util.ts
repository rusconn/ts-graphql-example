import { numChars } from "../../lib/string/numChars.ts";
import type { InvalidInputErrors } from "../../schema.ts";

export class ParseErr extends Error {
  field: string;

  static {
    ParseErr.prototype.name = "ParseErr";
  }

  constructor(field: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.field = field;
  }
}

export const invalidInputErrors = (errors: ParseErr[]): Required<InvalidInputErrors> => {
  return {
    __typename: "InvalidInputErrors",
    errors: errors.map((e) => ({
      field: e.field,
      message: e.message,
    })),
  };
};

export const parseArgNullability = <
  Args,
  ArgName extends keyof Args & string,
  Optional extends boolean,
  Nullable extends boolean,
>(
  args: Args,
  argName: keyof Args & string,
  { optional, nullable }: { optional: Optional; nullable: Nullable },
) => {
  const arg = args[argName];
  if (!optional && arg === undefined) {
    return new ParseErr(argName, `${argName} is required.`);
  }
  if (!nullable && arg === null) {
    return new ParseErr(argName, `The ${argName} must not be null.`);
  }

  return arg as Optional extends true
    ? Nullable extends true
      ? Args[ArgName]
      : Exclude<Args[ArgName], null>
    : Nullable extends true
      ? Exclude<Args[ArgName], undefined>
      : NonNullable<Args[ArgName]>;
};

export const parseArgNumChars = <Arg extends string>(
  arg: Arg,
  argName: string,
  options: {
    minChars?: number;
    maxChars?: number;
  } = {},
) => {
  const { minChars, maxChars } = options;
  if (minChars != null && numChars(arg) < minChars) {
    return new ParseErr(
      argName,
      `The ${argName} is below the minimum number of ${minChars} characters.`,
    );
  }
  if (maxChars != null && maxChars < numChars(arg)) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${maxChars} characters.`,
    );
  }

  return arg;
};
