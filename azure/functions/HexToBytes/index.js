/**
 * Takes a body with a hex string such as 0x.. and spits out the hex string as a byte array.
 */
module.exports = async function (context, req) {
    if (req.body) {
        var buf = Buffer.from(req.body.slice(2), "hex");
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