import {
  assertEquals,
  test,
} from "./test_deps.ts";

import { Registry } from "./registry.ts";
import { Collector } from "./collector.ts";

test({
  name: "Registry",
  fn() {
    const registry = new Registry();
    const collector1 = new Collector("collector1", "help1", "type");

    registry.register(collector1);
    const metricsText = "# HELP collector1 help1\n# TYPE collector1 type\n";
    assertEquals(registry.metrics(), metricsText);

    registry.unregister(collector1);
    assertEquals(registry.metrics(), "");

    registry.register(collector1);
    registry.clear();
    assertEquals(registry.metrics(), "");
  },
});
