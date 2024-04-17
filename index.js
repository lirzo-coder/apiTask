const axios = require("axios");
const Airtable = require("airtable");
const INTERVAL = 60000;
const CURRENCY_PAIR = "BTC-USD";
const TOKEN = "apikey";
const base = new Airtable({ apiKey: TOKEN }).base("appJdeGCINwqP2Uss");
const table = base("tbltF5W75ukQ864Zk");
let backupArray = [];

async function restoreBackup() {
    try {
        if (backupArray.length !== 0) {
            for (const record of backupArray) {
                await table.create(record);
            }
            backupArray = [];
        }
    } catch (e) {
        console.error("Failed to restore records!", e);
    }
}

async function syncBitcoinToTable() {
    let record;
    try {
        const res = await axios.get(
            `https://api.coinbase.com/v2/prices/${CURRENCY_PAIR}/sell`
        );

        const data = res.data?.data;

        if (!data) {
            console.error("no bitcoin data received!");
            return;
        }

        const bitcoinRate = parseFloat(data.amount);
        const timestamp = new Date();
        record = { Time: timestamp, Rates: bitcoinRate };
        await table.create(record);
        console.log("New record added: ", record);
    } catch (e) {
        console.error("Failed!", e);
        if (record) {
            backupArray.push(record);
        }
    }
}

setInterval(async () => {
    await restoreBackup();
    await syncBitcoinToTable();
}, INTERVAL);
