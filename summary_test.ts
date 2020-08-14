import {
  assertEquals,
  assertThrows,
  test,
} from "./test_deps.ts";

import { delay } from "https://deno.land/std/async/delay.ts";

import { Summary } from "./summary.ts";
import { Registry } from "./registry.ts";

test({
  name: "Summary.with",
  fn() {
    const summary = Summary.with({
      name: "summary_withouts_labels_and_percentiles",
      help: "help",
    });

    assertThrows(() => {
      Summary.with({
        name: "summary_withouts_labels_and_percentiles",
        help: "help",
      });
    });
  },
});

test({
  name: "Summary.observe",
  fn() {
    const summary = Summary.with({
      name: "summary_withouts_labels_and_percentiles",
      help: "help",
      registry: [new Registry()],
    });

    let count = 10;
    let sum = 0;
    let values = [];

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
      name: "summary_withouts_labels_and_percentiles",
      help: "help",
      maxAge: 3000, // ms
      registry: [new Registry()],
    });

    let count = 3;
    let sum = 0;
    let values = [1, 2, 3];

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
      name: "summary_withouts_labels_and_percentiles",
      help: "help",
      ageBuckets: 3,
      registry: [new Registry()],
    });

    let count = 10;
    let sum = 0;
    let values = [7, 8, 9];

    for (let i = 0; i < count; i++) {
      sum += i;
      summary.observe(i);
    }

    assertEquals(summary.getValues(), values);
    assertEquals(summary.getCount(), 3);
    assertEquals(summary.getSum(), values.reduce((s, v) => s + v, 0));
  },
});
