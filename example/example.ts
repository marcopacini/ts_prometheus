import { Counter } from "../counter.ts";
import { Gauge } from "../gauge.ts";
import { Histogram } from "../histogram.ts";
import { Summary } from "../summary.ts";
import { Registry } from "../registry.ts";

const counter = Counter.with({
  name: "http_requests_total",
  help: "The total number of HTTP requests.",
  labels: ["method", "status"],
});

const totalGetCreate = counter.labels({
  method: "GET",
  status: "201",
});

totalGetCreate.inc();
totalGetCreate.inc(42);

const gauge = Gauge.with({
  name: "cpu_time_usage",
  help: "The CPU time usage.",
  labels: ["mode"],
});

const cpuIdle = gauge.labels({
  mode: "idle",
});

cpuIdle.set(0);
cpuIdle.inc();
cpuIdle.inc(42);
cpuIdle.dec();
cpuIdle.dec(3.14);

const histogram = Histogram.with({
  name: "http_requests_duration",
  help: "A histogram of the requests duration.",
  buckets: [.05, .1, .2, .5, 1, 3],
});

histogram.observe(.42);
histogram.observe(.58);

const summary = Summary.with({
  name: "http_response_size",
  help: "A summary of the response size.",
  percentiles: [.25, .5, .75, 1],
});

const values = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
values.forEach((v) => summary.observe(v));

console.log(Registry.default.metrics());
