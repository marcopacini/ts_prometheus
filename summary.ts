import { Collector } from "./collector.ts";
import { Labels, Metric, Observe } from "./metric.ts";
import { Registry } from "./registry.ts";

export class Summary extends Metric implements Observe {
  private collector: Collector;
  private percentiles: number[];
  private count: number;
  private sum: number;
  private values: number[];

  static with(
    config: {
      name: string;
      help: string;
      labels?: string[];
      percentiles?: number[];
      registry?: Registry[];
    },
  ): Summary {
    const collector = new Collector(
      config.name,
      config.help,
      "summary",
      config.registry,
    );
    const labels = config.labels || [];
    const percentiles = config.percentiles || [.01, .05, .9, .95, .99];
    percentiles.forEach((v) => {
      if (v < 0 || v > 1) {
        throw new Error(`invalid percentile: ${v} not in [0,1]`);
      }
    });
    return new Summary(collector, labels, percentiles);
  }

  private constructor(
    collector: Collector,
    labels: string[],
    percentiles: number[],
  ) {
    super(labels, new Array(labels.length).fill(undefined));
    this.collector = collector;
    this.percentiles = percentiles.sort((a, b) => a < b ? -1 : 1);
    this.count = 0;
    this.sum = 0;
    this.values = [];
    this.collector.getOrSetMetric(this);
  }

  get description(): string {
    let labels = this.getLabelsAsString();
    return `${this.collector.name}${labels}`;
  }

  expose(): string {
    let text = "";

    for (let p of this.percentiles) {
      let labels = this.getLabelsAsString({ percentile: p.toString() });
      let index = Math.ceil(p * this.values.length);
      index = index == 0 ? 0 : index - 1;
      let value = this.values[index];
      text += `${this.collector.name}${labels} ${value}\n`;
    }

    text += `${this.collector.name}_sum ${this.sum}\n`;
    text += `${this.collector.name}_count ${this.count}`;

    return text;
  }

  labels(labels: Labels): Observe {
    let child = new Summary(this.collector, this.labelNames, this.percentiles);
    for (let key of Object.keys(labels)) {
      const index = child.labelNames.indexOf(key);
      if (index === -1) {
        throw new Error(`label with name ${key} not defined`);
      }
      child.labelValues[index] = labels[key];
    }
    child = child.collector.getOrSetMetric(child) as Summary;

    return {
      observe: (n) => {
        child.observe(n);
      },
    };
  }

  observe(n: number) {
    this.values.push(n);
    this.sum += n;
    this.count += 1;
  }
}
