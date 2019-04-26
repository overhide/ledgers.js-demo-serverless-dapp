const crypto = require('crypto')

const ENCODING = 'utf-8';
const HASH_ALGO = 'sha256';
const DIGEST_FORMAT = 'hex';

/**
 * @param {string} what - to hash
 * @returns {string} the hash
 */
function hash(what) {
    return crypto.createHash(HASH_ALGO).update(what, ENCODING).digest(DIGEST_FORMAT);
}

/**
 * Takes a body with a hex string such as 0x.. and spits out the hex string as a byte array.
 */
module.exports = async function (context, req) {
    if (req.body) {
        var buf = hash('foo');
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: buf,
            headers: {
                'Content-Type': 'application/octet-stream'
            },
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};