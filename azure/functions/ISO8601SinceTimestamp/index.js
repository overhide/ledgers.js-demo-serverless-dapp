const TIME_BACK_SECONDS = 24 * 60 * 60;

module.exports = async function (context, req) {
    var time = new Date((new Date()).getTime() - (TIME_BACK_SECONDS * 1000));
    context.res = {        
        body: time.toISOString()
    };
};