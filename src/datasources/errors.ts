import { BaseError } from "@/errors";

export class DataSourceError extends BaseError {}

export class InputTooLongError extends DataSourceError {}
export class NotFoundError extends DataSourceError {}
