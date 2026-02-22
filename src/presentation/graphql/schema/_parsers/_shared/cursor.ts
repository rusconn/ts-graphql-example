export const parseCursor = <T>(isCursor: (x: unknown) => x is T) => {
  return (input: unknown) => {
    if (!isCursor(input)) {
      return new Error("Malformed cursor");
    }

    return input;
  };
};
