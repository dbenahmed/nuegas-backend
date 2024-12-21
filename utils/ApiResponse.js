// success, message, statusCode, data, res
class ApiResponse {
    constructor(
        statusCode,
        message = 'Success',
        data,
        success = false,
    ) {
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.success = success
    }
}

module.exports = ApiResponse