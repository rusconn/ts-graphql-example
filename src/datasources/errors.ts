import { CustomError } from "@/errors";

export class DataSourceError extends CustomError {}

export class InputTooLongError extends DataSourceError {}
export class NotFoundError extends DataSourceError {}
export class NotUniqueError extends DataSourceError {}
