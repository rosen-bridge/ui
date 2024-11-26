class AppError extends Error {
  constructor(
    public message: string,
    public canBeHandled = true,
    public severity: 'error' | 'warn' | 'info' | 'debug',
    public stack = '',
    public context?: any,
  ) {
    super(message);
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
