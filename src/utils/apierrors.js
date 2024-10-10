class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", error = [], stack = "") {
      super(message); // Call the parent constructor (Error)
      this.statusCode = statusCode;
      this.error = error;
      this.data = null;
      this.success = false;
  
      // Capture stack trace if no custom stack is provided
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export default ApiError;
  