import type { InvalidInputErrors } from "../../_schema.ts";

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
