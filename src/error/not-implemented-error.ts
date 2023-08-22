import GeneralError from "./general-error.js";

export default class NotImplementedError extends GeneralError {
  constructor(public message = "Not Implemented", public code = 404) {
    super(message, code);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
