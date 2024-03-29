import { assertEquals, assertThrows, delay, test } from "./test_deps.ts";
import { Summary } from "./summary.ts";
import { Registry } from "./registry.ts";

test({
  name: "Summary.with",
  fn() {
    const summary = Summary.with({
      name: "summary_withouts_labels_and_quantiles",
      help: "help",
    });

    assertEquals(summary.expose(), undefined);

    assertThrows(() => {
      Summary.with({
        name: "summary_withouts_labels_and_quantiles",
        help: "help",
      });
    });
  },
});

test({
  name: "Summary.observe",
  fn() {
    const summary = Summary.with({
      name: "summary_withouts_labels_and_quantiles",
      help: "help",
      registry: [new Registry()],
    });

    assertEquals(summary.expose(), undefined);

    const count = 10;
    let sum = 0;
    const values = [];

    for (let i = 0; i < count; i++) {
      sum += i;
      values.push(i);
      summary.observe(i);
    }

    assertEquals(summary.getValues(), values);
    assertEquals(summary.getCount(), 10);
    assertEquals(summary.getSum(), sum);
  },
});

test({
  name: "Summary.observe (maxAge)",
  async fn() {
    const summary = Summary.with({
      name: "summary_withouts_labels_and_quantiles",
      help: "help",
      maxAge: 3000, // ms
      registry: [new Registry()],
    });

    const count = 3;
    let sum = 0;
    const values = [1, 2, 3];

    for (let i = 0; i < count; i++) {
      summary.observe(i);
    }

    await delay(3000);

    for (let i = 0; i < count; i++) {
      sum += i;
      summary.observe(i + 1);
    }

    assertEquals(summary.getValues(), values);
    assertEquals(summary.getCount(), count);
    assertEquals(summary.getSum(), values.reduce((s, v) => s + v, 0));
  },
});

test({
  name: "Summary.observe (ageBuckets)",
  fn() {
    const summary = Summary.with({
      name: "summary_withouts_labels_and_quantiles",
      help: "help",
      ageBuckets: 3,
      registry: [new Registry()],
    });

    const count = 10;
    let sum = 0;
    const values = [7, 8, 9];

    for (let i = 0; i < count; i++) {
      sum += i;
      summary.observe(i);
    }

    assertEquals(summary.getValues(), values);
    assertEquals(summary.getCount(), 3);
    assertEquals(summary.getSum(), values.reduce((s, v) => s + v, 0));
  },
});

const histogramTxt = `
# HELP summary_baz_bytes a very nice summary
# TYPE summary_baz_bytes summary
summary_baz_bytes{A="B",C="D",quantile="0.01"} 2
summary_baz_bytes{A="B",C="D",quantile="0.05"} 2
summary_baz_bytes{A="B",C="D",quantile="0.5"} 5
summary_baz_bytes{A="B",C="D",quantile="0.95"} 105
summary_baz_bytes{A="B",C="D",quantile="0.99"} 105
summary_baz_bytes_sum{A="B",C="D"} 250
summary_baz_bytes_count{A="B",C="D"} 8
`.trimStart();

test({
  name: "Histogram with labels outputs the correct format for prometheus",
  fn() {
    const summary = Summary.with({
      name: "summary_baz_bytes",
      help: "a very nice summary",
      labels: ["A", "C"],
    });

    const labels = { A: "B", C: "D" };

    summary.labels(labels).observe(2);
    summary.labels(labels).observe(3);
    summary.labels(labels).observe(4);
    summary.labels(labels).observe(5);
    summary.labels(labels).observe(23);
    summary.labels(labels).observe(7);
    summary.labels(labels).observe(101);
    summary.labels(labels).observe(105);

    assertEquals(Registry.default.metrics(), histogramTxt);
  },
});
