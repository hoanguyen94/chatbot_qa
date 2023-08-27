import GeneralError from "./general-error.js";

export default class BadRequestError extends GeneralError {
  constructor(public message = "Bad Request", public code = 400) {
    super(message, code);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
