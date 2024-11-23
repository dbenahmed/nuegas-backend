function sendResponse(success, message, statusCode, data, res) {
    if (!success) { console.log(message) }
    return res.json({ success, message, data }).status(statusCode)
}

module.exports = { sendResponse }