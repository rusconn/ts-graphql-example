export const parseCursor =
  <T>(isCursor: (x: unknown) => x is T) =>
  (input: string) => {
    if (!isCursor(input)) {
      return new Error("Malformed cursor");
    }

    return input;
  };
