import { err, ok, type Result } from "neverthrow";

import {
  isStringLengthTooLongError,
  isStringLengthTooShortError,
} from "../../../domain/entities/_shared/parse-errors.ts";
import { ParseErr } from "./error.ts";

export const parseStringArg = <
  Arg extends string, //
  Output,
  ParseError extends { type: string },
>(
  domainParser: (arg: Arg, argName: string) => Result<Output, ParseError>,
  options: {
    minChars?: number;
    maxChars?: number;
  } = {},
) => {
  return <
    Args extends Partial<Record<ArgName, Arg | null>>,
    ArgName extends keyof Args & string,
    Optional extends boolean,
    Nullable extends boolean,
  >(
    args: Args,
    argName: ArgName,
    nullability: {
      optional: Optional;
      nullable: Nullable;
    },
  ) => {
    const result1 = parseArgNullability(args, argName, nullability);
    if (result1.isErr()) {
      return err(result1.error);
    }

    if (result1.value == null) {
      return ok(result1.value) as unknown as Result<
        Optional extends true
          ? Nullable extends true
            ? null | undefined
            : undefined
          : Nullable extends true
            ? null
            : never,
        never
      >;
    }

    return domainParser(result1.value, argName).mapErr((e) => {
      if (isStringLengthTooShortError(e)) {
        if (options.minChars == null) throw new Error("specify minChars");
        return new ParseErr(
          argName,
          `The ${argName} is below the minimum number of ${options.minChars} characters.`,
        );
      }
      if (isStringLengthTooLongError(e)) {
        if (options.maxChars == null) throw new Error("specify maxChars");
        return new ParseErr(
          argName,
          `The ${argName} exceeds the maximum number of ${options.maxChars} characters.`,
        );
      }
      return new ParseErr(argName, e.type);
    });
  };
};

const parseArgNullability = <
  Args extends Partial<Record<string, unknown>>,
  ArgName extends keyof Args & string,
  Optional extends boolean,
  Nullable extends boolean,
>(
  args: Args,
  argName: ArgName,
  { optional, nullable }: { optional: Optional; nullable: Nullable },
): Result<
  Optional extends true
    ? Nullable extends true
      ? Args[ArgName]
      : Exclude<Args[ArgName], null>
    : Nullable extends true
      ? Exclude<Args[ArgName], undefined>
      : NonNullable<Args[ArgName]>,
  ParseErr
> => {
  const arg = args[argName];
  if (!optional && arg === undefined) {
    return err(new ParseErr(argName, `${argName} is required.`));
  }
  if (!nullable && arg === null) {
    return err(new ParseErr(argName, `The ${argName} must not be null.`));
  }

  // biome-ignore lint/suspicious/noExplicitAny: i lost the type puzzle
  return ok(arg) as any;
};
