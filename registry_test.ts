import { assertEquals, test } from "./test_deps.ts";

import { Registry } from "./registry.ts";
import { Collector } from "./collector.ts";

test({
  name: "Registry",
  fn() {
    const registry = new Registry();
    const collector = new Collector("collector", "help", "type");

    registry.register(collector);
    registry.unregister(collector);
    assertEquals(registry.metrics(), "");

    registry.register(collector);
    registry.clear();
    assertEquals(registry.metrics(), "");
  },
});
