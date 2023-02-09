import { Collector } from "./collector.ts";
import { Labels, Metric, Observe } from "./metric.ts";
import { Registry } from "./registry.ts";

class Sample {
  private timestamp: number;
  private value: number;

  constructor(value: number) {
    this.timestamp = new Date().getTime();
    this.value = value;
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  getValue(): number {
    return this.value;
  }
}

export class Summary extends Metric implements Observe {
  private collector: Collector;
  private percentiles: number[];
  private values: Sample[];
  private maxAge?: number;
  private ageBuckets?: number;

  static with(
    config: {
      name: string;
      help: string;
      labels?: string[];
      percentiles?: number[];
      maxAge?: number;
      ageBuckets?: number;
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
    return new Summary(
      collector,
      labels,
      percentiles,
      config.maxAge,
      config.ageBuckets,
    );
  }

  private constructor(
    collector: Collector,
    labels: string[],
    percentiles: number[],
    maxAge?: number,
    ageBuckets?: number,
  ) {
    super(labels, new Array(labels.length).fill(undefined));
    this.collector = collector;
    this.percentiles = percentiles.sort((a, b) => a < b ? -1 : 1);
    this.values = [];
    this.maxAge = maxAge;
    this.ageBuckets = ageBuckets;
    this.collector.getOrSetMetric(this);
  }

  get description(): string {
    const labels = this.getLabelsAsString();
    return `${this.collector.name}${labels}`;
  }

  private clean() {
    // Remove older than maxAge
    if (this.maxAge !== undefined) {
      const limit = new Date().getTime() - this.maxAge;
      let i = 0;
      while (i < this.values.length) {
        if (this.values[i].getTimestamp() > limit) {
          break;
        }
        i++;
      }
      this.values = this.values.slice(i);
    }
    // Remove extra values
    if (this.ageBuckets !== undefined) {
      const index = this.values.length - this.ageBuckets;
      this.values = this.values.splice(index);
    }
  }

  expose(): string | undefined {
    if (this.values.length === 0) {
      return undefined;
    }

    let text = "";

    this.clean();
    const sorted = this.values.slice().sort((a, b) => a.getValue() - b.getValue());

    for (const p of this.percentiles) {
      const labels = this.getLabelsAsString({ quantile: p.toString() });
      let index = Math.ceil(p * sorted.length);
      index = index == 0 ? 0 : index - 1;
      const value = sorted[index].getValue();
      text += `${this.collector.name}${labels} ${value}\n`;
    }

    const labels = this.getLabelsAsString();
    const sum = this.values.reduce((sum, v) => sum + v.getValue(), 0);
    text += `${this.collector.name}_sum${labels} ${sum}\n`;
    text += `${this.collector.name}_count${labels} ${sorted.length}`;

    return text;
  }

  labels(labels: Labels): Observe {
    let child = new Summary(this.collector, this.labelNames, this.percentiles);
    for (const key of Object.keys(labels)) {
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
    this.values.push(new Sample(n));
  }

  getCount(): number {
    this.clean();
    return this.values.length;
  }

  getSum(): number {
    this.clean();
    return this.values.reduce((sum, v) => sum + v.getValue(), 0);
  }

  getValues(): number[] {
    this.clean();
    return this.values.map((s) => s.getValue());
  }
}
