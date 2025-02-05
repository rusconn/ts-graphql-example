export class ParseErr extends Error {
  field: string;

  static {
    ParseErr.prototype.name = "ParseError";
  }

  constructor(field: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.field = field;
  }
}

export const parseArg =
  <
    Arg, //
    Output,
  >(
    additionalParse: (arg: Arg, argName: string) => Output | ParseErr,
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
      return new ParseErr(argName, `${argName} is required.`);
    }
    if (!nullable && arg === null) {
      return new ParseErr(argName, `The ${argName} must not be null.`);
    }

    const parsed = additionalParse(arg, argName);

    if (parsed instanceof ParseErr) {
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
