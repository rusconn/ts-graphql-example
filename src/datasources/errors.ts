import ExtensibleCustomError from "extensible-custom-error";

export class DataSourceError extends ExtensibleCustomError {}

export class InputTooLongError extends DataSourceError {}
export class NotFoundError extends DataSourceError {}
export class NotUniqueError extends DataSourceError {}
