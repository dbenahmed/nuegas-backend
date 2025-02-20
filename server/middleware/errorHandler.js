const ApiError = require('../utils/ApiError.js')

const errorHandler = (err, req, res, next) => {
    let response
    // check if the given status code is a actual number if not send a server error

    // if the error is a custom error made by the code and not an SDK ( mongoose or another library )
    if (err instanceof ApiError) {
        if (!Number.isInteger(err.statusCode)) {
            res.status(500).json({
                success: false, message: `${err.statusCode} is not a number`
            })
        }
        response = err.toJson()
        res.status(err.statusCode || 500);
    } else {
        response = ({...err, message: err.message})
        res.status(err.statusCode || 500);
    }
    res.json(response)
}
module.exports = errorHandler