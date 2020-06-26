import { Collector } from "./collector.ts";
import { Labels, Metric, Observe } from "./metric.ts";
import { Registry } from "./registry.ts";

export class Histogram extends Metric implements Observe {
  private collector: Collector;
  private buckets: number[];
  private count: number;
  private sum: number;
  private values: number[];

  static with(
    config: {
      name: string;
      help: string;
      labels?: string[];
      buckets: number[];
      registry?: Registry[];
    },
  ): Histogram {
    const collector = new Collector(
      config.name,
      config.help,
      "histogram",
      config.registry,
    );
    const labels = config.labels || [];
    const buckets = config.buckets || [];
    buckets.push(Infinity);
    return new Histogram(collector, labels, buckets);
  }

  private constructor(
    collector: Collector,
    labels: string[],
    buckets: number[],
  ) {
    super(labels, new Array(labels.length).fill(undefined));
    this.collector = collector;
    this.buckets = buckets.sort((a, b) => a < b ? -1 : 1);
    this.count = 0;
    this.sum = 0;
    this.values = new Array(this.buckets.length).fill(0);
    this.collector.getOrSetMetric(this);
  }

  get description(): string {
    let labels = this.getLabelsAsString();
    return `${this.collector.name}${labels}`;
  }

  expose(): string {
    let text = "";
    for (let i = 0; i < this.buckets.length; i++) {
      let labels = this.getLabelsAsString();
      labels = labels.slice(0, -1) + `,le="${this.buckets[i]}"}`;
      labels = labels.replace("Infinity", "+Inf");
      text += `${this.collector.name}_bucket${labels} ${this.values[i]}\n`;
    }
    text += `${this.collector.name}_sum ${this.sum}\n`;
    text += `${this.collector.name}_count ${this.count}`;
    return text;
  }

  labels(labels: Labels): Observe {
    let child = new Histogram(this.collector, this.labelNames, this.buckets);
    for (let key of Object.keys(labels)) {
      const index = child.labelNames.indexOf(key);
      if (index === -1) {
        throw new Error(`label with name ${key} not defined`);
      }
      child.labelValues[index] = labels[key];
    }
    child = child.collector.getOrSetMetric(child) as Histogram;

    return {
      observe: (n) => {
        child.observe(n);
      },
    };
  }

  observe(n: number) {
    let index = this.buckets.findIndex((v) => v >= n);
    for (let i = index; i < this.values.length; i++) {
      this.values[i] += 1;
    }
    this.sum += n;
    this.count += 1;
  }
}
