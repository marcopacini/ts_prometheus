# ts-prometheus

A prometheus client for Deno that supports counter, gauge and histrogram metric
types.

## Usage

By default all metrics are registered in the global `Registry` accessible via
`Registry.default`. The `Registry` class has the method `metrics()` that returns
the text-based exposition for all metrics collected. But it is possible 
specified one or more custom registry:

```ts
const myRegistry = new Registry();
const myCounter = Counter.with({
    name: 'my_counter',
    help: 'a counter with custom registry',
    regitry: [ myRegistry ]
})
```

## Examples

- [oak](https://github.com/marcopacini/ts-prometheus/blob/master/example/oak/main.ts)

## Metric Types

### Counter

```ts
const counter = Counter.with({
    name: 'http_requests_total',
    help: 'The total number of HTTP requests.',
    labels: [ 'method', 'status' ],
})

const totalGetCreate = counter.labels({
    method: 'GET',
    status: '201'
})

totalGetCreate.inc()
totalGetCreate.inc(42)
```

```text
# HELP http_requests_total The total number of HTTP requests.
# TYPE http_requests_total counter
http_requests_total{method="GET",status="201"} 43
```

### Gauge

```ts
const gauge = Gauge.with({
    name: 'cpu_time_usage',
    help: 'The CPU time usage.',
    labels: [ 'mode' ],
})

const cpuIdle = gauge.labels({
    mode: 'idle'
})

cpuIdle.set(0)
cpuIdle.inc()
cpuIdle.inc(42)
cpuIdle.dec()
cpuIdle.dec(3.14)
```

```
# HELP cpu_time_usage The CPU time usage.
# TYPE cpu_time_usage gauge
cpu_time_usage{mode="idle"} 38.86
```

### Histogram

```ts
const histogram = Histogram.with({
    name: 'http_requests_duration',
    help: 'A histogram of the requests duration.',
    buckets: [ .05, .1, .2, .5, 1, 3 ],
})

histogram.observe(.42)
histogram.observe(.58)
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