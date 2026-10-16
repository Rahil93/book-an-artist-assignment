class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

const errorHandler = (err, req, res, next) => {
    const statusCode = err?.statusCode || 500;
    const message = err?.message || 'Internal Server Error';

    res.status(statusCode).json({
        // status: 'error',
        success: false,
        // statusCode,
        ...(!err?.errors?.length && { error:message }),
        ...(err?.errors?.length && { errors: err?.errors }),
        stack: err.stack,
    });
};

export { ApiError, errorHandler }