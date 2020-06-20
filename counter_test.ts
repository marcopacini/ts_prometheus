import {
  assertEquals,
  assertThrows,
  test,
} from "./test_deps.ts";

import { Counter } from "./counter.ts";

test({
  name: "Counter",
  fn() {
    const counter1 = Counter.with({
      name: "counter_without_labels",
      help: "help",
    });

    assertEquals(counter1.description, "counter_without_labels");
    assertEquals(counter1.expose(), "counter_without_labels 0");
    assertEquals(counter1.value(), 0);

    counter1.inc();
    assertEquals(counter1.expose(), "counter_without_labels 1");

    counter1.inc(42);
    assertEquals(counter1.expose(), "counter_without_labels 43");

    assertThrows(() => {
      Counter.with({
        name: "counter_without_labels",
        help: "help",
        labels: [],
      });
    });

    const counter2 = Counter.with({
      name: "counter_with_labels",
      help: "help",
      labels: ["label1", "label2"],
    });

    assertEquals(counter2.description, "counter_with_labels");
    assertEquals(counter2.expose(), "counter_with_labels 0");
    assertEquals(counter2.value(), 0);

    assertThrows(() => {
      counter2.inc(-1);
    });

    const counterLabel1 = counter2.labels({ label1: "value1" });
    counterLabel1.inc();
    assertEquals(counterLabel1.value(), 1);
    counterLabel1.inc(42);
    assertEquals(counterLabel1.value(), 43);
  },
});
