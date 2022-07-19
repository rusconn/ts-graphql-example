import ExtensibleCustomError from "extensible-custom-error";

/** アプリで使うエラーのベース */
export class BaseError extends ExtensibleCustomError {
  // これが無いと pino のログでエラーオブジェクトが {} に化ける
  toJSON() {
    return { name: this.name, stack: this.stack };
  }
}

export class ParseError extends BaseError {}
