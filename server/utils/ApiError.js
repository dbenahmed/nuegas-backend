class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong',
        data = {},
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.success = false
        this.errors = errors
        this.message = message
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }

    toJson() {
        return ({
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            success: this.success,
            errors: this.errors,
        })
    }
}

module.exports = ApiError