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
