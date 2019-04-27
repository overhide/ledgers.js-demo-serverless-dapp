const PERIOD_SECONDS = 5; //24 * 60 * 60;

// Expects:  {'ledgerKey':..,'txs'.., 'lastPaymentUnixTime':.., "zoneAPrice":.., "zoneBPrice":.., "zoneCPrice":..}
//
// where txs are as per return from 'get-transactions' in overhide remuneration API.
//
// lastPaymentUnixTime is as per contract for current payer
//
// zone?Price are the prices for permit into indicated zone
//
// @returns {"zoneATimestamp":.., "zoneBTimestamp":..,"zoneCTimestamp":..} as 'application/json'
module.exports = async function (context, req) {
    if (req.body.ledgerKey
        && req.body.txs 
        && req.body.lastPaymentUnixTime
        && req.body.zoneAPrice
        && req.body.zoneBPrice
        && req.body.zoneCPrice) {

        var txs = req.body.txs;
        var cutoffTime = req.body.lastPaymentUnixTime;

        var txEnds = txs.transactions.map((rec) => {return {value: rec["transaction-value"], time: parseInt((new Date(rec["transaction-date"]).getTime())/1000)}})
            .sort((recA, recB) => recA.time - recB.time)
            .map((rec) => {return {value: rec.value, time: rec.time + PERIOD_SECONDS}})
            .filter((rec) => rec.time > cutoffTime);

        var maxAmount = txEnds.reduce((p, c) => p + c.value, 0);

        var histogram = txEnds.map((rec) => {
            let newValue = maxAmount;
            maxAmount -= rec.value;
            return { value: newValue, time: rec.time}
        });

        var zoneAPrice = req.body.zoneAPrice * (req.body.ledgerKey == 'eth-web3' ? 1000000000000000000 : 100);
        var zoneBPrice = req.body.zoneBPrice * (req.body.ledgerKey == 'eth-web3' ? 1000000000000000000 : 100);
        var zoneCPrice = req.body.zoneCPrice * (req.body.ledgerKey == 'eth-web3' ? 1000000000000000000 : 100);

        var zoneATimestamp = histogram.reduce((p,c) => c.value >= zoneAPrice ? c.time : p, 0);
        var zoneBTimestamp = histogram.reduce((p, c) => c.value >= zoneBPrice ? c.time : p, 0);
        var zoneCTimestamp = histogram.reduce((p, c) => c.value >= zoneCPrice ? c.time : p, 0);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: { zoneATimestamp: zoneATimestamp, zoneBTimestamp: zoneBTimestamp, zoneCTimestamp: zoneCTimestamp},
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
    else {
        context.res = {
            status: 400,
            body: `Expects:  {'txs'.., 'lastPaymentUnixTime':.., "zoneAPrice":.., "zoneBPrice":.., "zoneCPrice":..}`
        };
    }
};