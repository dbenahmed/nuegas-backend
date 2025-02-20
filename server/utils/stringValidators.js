function stringDoesNotContainSpecialCharacters(str) {
    // should only contain the special character - or letters and numbers and spaces
    const regex = /^[a-zA-Z0-9\s-]+$/
    const test = regex.test(str)
    return test
}
function stringIsUndefined(str) {
    return str === undefined
}
module.exports = {
    stringDoesNotContainSpecialCharacters,
    stringIsUndefined,
}