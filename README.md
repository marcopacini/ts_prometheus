# ts_prometheus

A prometheus client for Deno that supports counter, gauge, histrogram and
summary metric types.

## Usage

By default all metrics are registered in the global `Registry` accessible via
`Registry.default`. The `Registry` class has the method `metrics()` that returns
the text-based exposition for all metrics collected. But it is possible
specified one or more custom registry:

```ts
const myRegistry = new Registry();
const myCounter = Counter.with({
  name: "my_counter",
  help: "a counter with custom registry",
  registry: [myRegistry],
});
```

## Examples

- [ts-prometheus](https://github.com/marcopacini/ts-prometheus/blob/master/example/example.ts)
- [oak](https://github.com/marcopacini/ts-prometheus/blob/master/example/oak/example.ts)

## Metric Types

### Counter

```ts
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
```

```text
# HELP http_requests_total The total number of HTTP requests.
# TYPE http_requests_total counter
http_requests_total{method="GET",status="201"} 43
```

### Gauge

```ts
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
```

```
# HELP cpu_time_usage The CPU time usage.
# TYPE cpu_time_usage gauge
cpu_time_usage{mode="idle"} 38.86
```

### Histogram

```ts
const histogram = Histogram.with({
  name: "http_requests_duration",
  help: "A histogram of the requests duration.",
  buckets: [.05, .1, .2, .5, 1, 3],
});

histogram.observe(.42);
histogram.observe(.58);
```

```
# HELP http_requests_duration A histogram of the requests duration.
# TYPE http_requests_duration histogram
http_requests_duration_bucket{le="0.05"} 0
http_requests_duration_bucket{le="0.1"} 0
http_requests_duration_bucket{le="0.2"} 0
http_requests_duration_bucket{le="0.5"} 1
http_requests_duration_bucket{le="1"} 2
http_requests_duration_bucket{le="3"} 2
http_requests_duration_bucket{le="+Inf"} 2
http_requests_duration_sum 1
http_requests_duration_count 2
```

### Summary

By default quantiles when not set are `[ .01, .05, .5, .95, .99 ]`.

```ts
let summary = Summary.with({
  name: "http_response_size",
  help: "A summary of the response size.",
  quantiles: [.25, .5, .75, 1],
});

let values = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
values.forEach((v) => summary.observe(v));
```

```
# HELP http_response_size A summary of the response size.
# TYPE http_response_size summary
http_response_size{quantile="0.25"} 2
http_response_size{quantile="0.5"} 5
http_response_size{quantile="0.75"} 21
http_response_size{quantile="1"} 55
http_response_size_sum 143
http_response_size_count 10
```

A sliding time window can be set using `maxAge` for defining the age of
observation in milliseconds, or `ageBuckets` for limiting the max number of
observations.

```ts
Summary.with({
  name: "http_response_size",
  help: "A summary of the response size.",
  quantiles: [.25, .5, .75, 1],
  maxAge: 1000, // milliseconds
  ageBuckets: 5, // number of observations
});
```
