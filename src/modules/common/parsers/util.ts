export const parseErr = (message: string) => {
  return new Error(message);
};

export const parseArgs =
  <Args, Arg, Output>(
    name: string,
    toArg: (args: Args) => Arg,
    // boolean: 型パズルに敗北した
    additionalParse: (arg: Arg, optional: boolean, nullable: boolean) => Output | Error,
  ) =>
  <Optional extends boolean, Nullable extends boolean>(
    args: Args,
    { optional, nullable }: { optional: Optional; nullable: Nullable },
  ) => {
    const arg = toArg(args);

    if (!optional && arg === undefined) {
      return parseErr(`"${name}" is required`);
    }
    if (!nullable && arg === null) {
      return parseErr(`"${name}" must not be null`);
    }

    const parsed = additionalParse(arg, optional, nullable);

    if (parsed instanceof Error) {
      return parsed;
    }

    return arg as Optional extends true
      ? Nullable extends true
        ? Output
        : Exclude<Output, null>
      : Nullable extends true
        ? Exclude<Output, undefined>
        : NonNullable<Output>;
  };
