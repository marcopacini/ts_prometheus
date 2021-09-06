import { assertEquals, assertThrows, test } from "./test_deps.ts";

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
