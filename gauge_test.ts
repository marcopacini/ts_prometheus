import {
  assertEquals,
  assertThrows,
  test,
} from "./test_deps.ts";

import { Gauge } from "./gauge.ts";

test({
  name: "Gauge",
  fn() {
    const gauge1 = Gauge.with({
      name: "gauge_without_labels",
      help: "help",
      labels: [],
    });

    assertEquals(gauge1.description, "gauge_without_labels");
    assertEquals(gauge1.expose(), "gauge_without_labels 0");
    assertEquals(gauge1.value(), 0);

    gauge1.inc();
    assertEquals(gauge1.expose(), "gauge_without_labels 1");
    assertEquals(gauge1.value(), 1);
    gauge1.inc(42);
    assertEquals(gauge1.expose(), "gauge_without_labels 43");
    assertEquals(gauge1.value(), 43);

    gauge1.dec();
    assertEquals(gauge1.expose(), "gauge_without_labels 42");
    assertEquals(gauge1.value(), 42);
    gauge1.dec(42);
    assertEquals(gauge1.expose(), "gauge_without_labels 0");
    assertEquals(gauge1.value(), 0);

    assertThrows(() => {
      Gauge.with({
        name: "gauge_without_labels",
        help: "help",
        labels: [],
      });
    });

    const gauge2 = Gauge.with({
      name: "gauge_with_labels",
      help: "help",
      labels: ["label1", "label2"],
    });

    assertEquals(gauge2.description, "gauge_with_labels");
    assertEquals(gauge2.expose(), "gauge_with_labels 0");
    assertEquals(gauge2.value(), 0);

    assertThrows(() => {
      gauge2.inc(-1);
    });

    const gaugeLabel1 = gauge2.labels({ label1: "value1" });

    gaugeLabel1.inc();
    assertEquals(gaugeLabel1.value(), 1);
    gaugeLabel1.inc(42);
    assertEquals(gaugeLabel1.value(), 43);
    gaugeLabel1.dec();
    assertEquals(gaugeLabel1.value(), 42);
    gaugeLabel1.dec(17);
    assertEquals(gaugeLabel1.value(), 25);
  },
});
