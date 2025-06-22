const fs = require("fs");
const path = require("path");

const resultsFile = path.resolve(__dirname, "../results.json");
const reportFile = path.resolve(__dirname, "../summary.txt");

if (!fs.existsSync(resultsFile)) {
    console.error("❌ results.json not found.");
    process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
const agg = results.aggregate || {};

const durationMs = agg.lastMetricAt && agg.firstMetricAt
    ? agg.lastMetricAt - agg.firstMetricAt
    : null;
const durationSec = durationMs ? (durationMs / 1000).toFixed(2) : "N/A";

const totalRequests = agg.counters?.["http.requests"];
const rps = agg.rates?.["http.request_rate"];
const latencyMean = agg.summaries?.["http.response_time"]?.mean;

if (!totalRequests) console.warn("⚠️  totalRequests missing: check aggregate.counters[\"http.requests\"]");
if (!rps) console.warn("⚠️  RPS missing: check aggregate.rates[\"http.request_rate\"]");
if (!latencyMean) console.warn("⚠️  latencyMean missing: check aggregate.summaries[\"http.response_time\"].mean");

const output = `
📊 Artillery Load Test Summary
------------------------------
🕒 Duration       : ${durationSec}
📨 Total Requests : ${totalRequests || "N/A"}
⚡ RPS            : ${rps || "N/A"}
⏱️ Latency (avg)  : ${latencyMean || "N/A"} ms
`;

fs.writeFileSync(reportFile, output);
console.log(output);