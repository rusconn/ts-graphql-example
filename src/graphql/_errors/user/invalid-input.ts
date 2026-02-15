import type { ParseErr } from "../../_parsers/_shared/error.ts";
import type { InvalidInputErrors } from "../../_schema.ts";

export const invalidInputErrors = (errors: ParseErr[]): Required<InvalidInputErrors> => {
  return {
    __typename: "InvalidInputErrors",
    errors: errors.map((e) => ({
      field: e.field,
      message: e.message,
    })),
  };
};
