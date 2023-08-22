export default class GeneralError extends Error {
  constructor(public message: string, public code: number) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
