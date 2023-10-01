import ExtensibleCustomError from "extensible-custom-error";

export class PrismaError extends ExtensibleCustomError {}

export class InputTooLongError extends PrismaError {}
export class NotExistsError extends PrismaError {}
export class NotUniqueError extends PrismaError {}
