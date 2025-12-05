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

export const parseStringArg =
  <Arg extends string, Output extends Arg = Arg>(
    options: {
      minChars?: number;
      maxChars?: number;
      additionalParse?: (arg: Arg, argName: string) => Output | ParseErr;
    } = {},
  ) =>
  <
    Args extends Partial<Record<ArgName, Arg | null>>,
    ArgName extends keyof Args & string,
    Optional extends boolean,
    Nullable extends boolean,
  >(
    args: Args,
    argName: ArgName,
    {
      optional,
      nullable,
    }: {
      optional: Optional;
      nullable: Nullable;
    },
  ) => {
    const { additionalParse = (s) => s as Output, ...numCharsOptions } = options;

    const string1 = parseArgNullability(args, argName, {
      optional,
      nullable,
    });

    if (string1 instanceof ParseErr) {
      return string1;
    }
    if (string1 == null) {
      return string1 as unknown as Optional extends true
        ? Nullable extends true
          ? null | undefined
          : undefined
        : Nullable extends true
          ? null
          : never;
    }

    const string2 = parseArgNumChars(string1, argName, numCharsOptions);

    if (string2 instanceof ParseErr) {
      return string2;
    }

    return additionalParse(string2, argName);
  };
