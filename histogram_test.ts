import { assertEquals, assertThrows, test } from "./test_deps.ts";
import { Registry } from "./registry.ts";
import { Histogram } from "./histogram.ts";

test({
  name: "Histogram.with",
  fn() {
    const histogram = Histogram.with({
      name: "histogram_without_labels_and_buckets",
      help: "help",
      buckets: [],
    });

    assertEquals(histogram.expose(), undefined);

    assertThrows(() => {
      Histogram.with({
        name: "histogram_without_labels_and_buckets",
        help: "help",
        buckets: [],
      });
    });
  },
});

// Reference: https://github.com/open-telemetry/opentelemetry-go/blob/d5fca833d6f6fc75e092c2108e0265aa778b8923/exporters/prometheus/testdata/histogram.txt
//       and: https://github.com/open-telemetry/opentelemetry-go/blob/d5fca833d6f6fc75e092c2108e0265aa778b8923/exporters/prometheus/exporter_test.go#L93-L112

const histogramTxt = `
# HELP histogram_baz_bytes a very nice histogram
# TYPE histogram_baz_bytes histogram
histogram_baz_bytes_bucket{A="B",C="D",le="0"} 0
histogram_baz_bytes_bucket{A="B",C="D",le="5"} 0
histogram_baz_bytes_bucket{A="B",C="D",le="10"} 1
histogram_baz_bytes_bucket{A="B",C="D",le="25"} 2
histogram_baz_bytes_bucket{A="B",C="D",le="50"} 2
histogram_baz_bytes_bucket{A="B",C="D",le="75"} 2
histogram_baz_bytes_bucket{A="B",C="D",le="100"} 2
histogram_baz_bytes_bucket{A="B",C="D",le="250"} 4
histogram_baz_bytes_bucket{A="B",C="D",le="500"} 4
histogram_baz_bytes_bucket{A="B",C="D",le="1000"} 4
histogram_baz_bytes_bucket{A="B",C="D",le="+Inf"} 4
histogram_baz_bytes_sum{A="B",C="D"} 236
histogram_baz_bytes_count{A="B",C="D"} 4
`.trimStart();

test({
  name: "Histogram with labels outputs the correct format for prometheus",
  fn() {
    const histogram = Histogram.with({
      name: "histogram_baz_bytes",
      help: "a very nice histogram",
      buckets: [0, 5, 10, 25, 50, 75, 100, 250, 500, 1000],
      labels: ["A", "C"],
    });

    const labels = { A: "B", C: "D" };

    histogram.labels(labels).observe(23);
    histogram.labels(labels).observe(7);
    histogram.labels(labels).observe(101);
    histogram.labels(labels).observe(105);

    assertEquals(Registry.default.metrics(), histogramTxt);
  },
});
