const ApiError = require('../utils/ApiError.js')

const errorHandler = (err, req, res, next) => {
    let response
    if (!Number.isInteger(err.statusCode)) {
        res.status(500).json({
            success: false, message: `${err.statusCode} is not a number`
        })
    }
    if (err instanceof ApiError) {
        response = err.toJson()
        res.status(err.statusCode || 500);
    } else {
        response = ({...err, message: err.message})
        res.status(err.statusCode || 500);
    }
    res.json(response)
}
module.exports = errorHandler