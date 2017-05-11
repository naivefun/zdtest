module.exports.run = function replaceRepeatedChars(str) {
    if (typeof str === 'string') {
        // return str.replace(/([a-zA-Z])\1{1,}/g, '$1');
        return str.replace(/([a-zA-Z])\1{1,}/g, (match, contents) => { return contents + match.length; });
    }
}
