import {
  assert,
  assertEquals,
  assertThrows,
  MetricMock,
  test,
} from "./test_deps.ts";

import { isValidLabelName } from "./metric.ts";

test({
  name: "isValidLabelName",
  fn() {
    const validNames = [
      "valid_label_name",
      "VALID_LABEL_NAME",
      "_valid_label_name_",
      "valid_label_name_2",
    ];

    for (const name of validNames) {
      assert(isValidLabelName(name));
    }

    const invalidNames = [
      "",
      "0_invalid_metric_name",
      "$@#!",
    ];

    for (const name of invalidNames) {
      assert(!isValidLabelName(name));
    }
  },
});

test({
  name: "Metric",
  fn() {
    const labelNames = ["label1", "label2"];
    const invalidLabelNames = ["", ""];
    const labelValues = ["value1", "value2"];

    assertThrows(() => {
      new MetricMock(labelNames);
    });
    assertThrows(() => {
      new MetricMock(invalidLabelNames, labelValues);
    });

    const metricWithoutLabel = new MetricMock();
    assertEquals(metricWithoutLabel.getLabelsAsString(), "");

    const metricWithLabel = new MetricMock(labelNames, labelValues);
    const expectedLabesAsString = '{label1="value1",label2="value2"}';
    assertEquals(metricWithLabel.getLabelsAsString(), expectedLabesAsString);
  },
});
