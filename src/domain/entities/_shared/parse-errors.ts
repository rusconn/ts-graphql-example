export type StringLengthTooShortError = typeof stringLengthTooShortError;

export const stringLengthTooShortError = {
  type: "too short",
} as const;

export const isStringLengthTooShortError = (e: {
  type: string;
}): e is StringLengthTooShortError => {
  return e.type === stringLengthTooShortError.type;
};

export type StringLengthTooLongError = typeof stringLengthTooLongError;

export const stringLengthTooLongError = {
  type: "too long",
} as const;

export const isStringLengthTooLongError = (e: {
  type: string; //
}): e is StringLengthTooLongError => {
  return e.type === stringLengthTooLongError.type;
};

export type InvalidFormatError = typeof invalidFormatError;

export const invalidFormatError = {
  type: "invalid format",
} as const;
