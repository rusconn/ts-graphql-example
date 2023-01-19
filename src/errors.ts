import ExtensibleCustomError from "extensible-custom-error";

/** アプリで使うエラーのベース */
export class BaseError extends ExtensibleCustomError {}

export class ParseError extends BaseError {}
