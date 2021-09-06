import { Collector } from "./collector.ts";

export class Registry {
  // The default CollectorRegistry
  static default = new Registry();

  private collectors: Map<string, Collector>;

  constructor() {
    this.collectors = new Map();
  }

  register(collector: Collector) {
    const found = this.collectors.has(collector.name);
    if (found) {
      throw new Error(
        `a collector with name ${collector.name} has been registered`,
      );
    }
    this.collectors.set(collector.name, collector);
  }

  unregister(collector: Collector) {
    this.collectors.delete(collector.name);
  }

  clear() {
    this.collectors = new Map();
  }

  metrics(): string {
    let text = "";
    for (const [_, collector] of this.collectors) {
      let collectorText =
        `# HELP ${collector.name} ${collector.help}\n# TYPE ${collector.name} ${collector.type}\n`;

      let count = 0;
      for (const metric of collector.collect()) {
        const metricText = metric.expose();
        if (metricText !== undefined) {
          collectorText += metricText + "\n";
          count++;
        }
      }

      if (count > 0) {
        text += collectorText + "\n";
      }
    }
    text = text.slice(0, -1); // remove last new line
    return text;
  }
}
