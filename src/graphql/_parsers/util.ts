export const parseErr = (message: string) => {
  return new Error(message);
};

export const parseArg =
  <
    Arg, //
    Output,
  >(
    additionalParse: (arg: Arg, argName: string) => Output | Error,
  ) =>
  <
    Optional extends boolean, //
    Nullable extends boolean,
  >(
    arg: Arg,
    argName: string,
    { optional, nullable }: { optional: Optional; nullable: Nullable },
  ) => {
    if (!optional && arg === undefined) {
      return parseErr(`${argName} is required.`);
    }
    if (!nullable && arg === null) {
      return parseErr(`The ${argName} must not be null.`);
    }

    const parsed = additionalParse(arg, argName);

    if (parsed instanceof Error) {
      return parsed;
    }

    return parsed as Optional extends true
      ? Nullable extends true
        ? Output
        : Exclude<Output, null>
      : Nullable extends true
        ? Exclude<Output, undefined>
        : NonNullable<Output>;
  };
