function sendResponse(success, message, statusCode, data,res) {
    return res.json({ success, message, data }).status(statusCode)
}

module.exports = { sendResponse }