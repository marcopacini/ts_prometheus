import { Collector } from "./collector.ts";
import { Inc, Labels, Metric, Value } from "./metric.ts";
import { Registry } from "./registry.ts";
export class Counter extends Metric implements Inc, Value {
  private collector: Collector;
  private _value?: number;

  static with(
    config: {
      name: string;
      help: string;
      labels?: string[];
      registry?: Registry[];
    },
  ): Counter {
    const collector = new Collector(
      config.name,
      config.help,
      "counter",
      config.registry,
    );
    const labels = config.labels || [];
    return new Counter(collector, labels);
  }

  private constructor(
    collector: Collector,
    labels: string[] = [],
  ) {
    super(labels, new Array(labels.length).fill(undefined));
    this.collector = collector;
    this._value = undefined;
    this.collector.getOrSetMetric(this);
  }

  get description(): string {
    let labels = this.getLabelsAsString();
    return `${this.collector.name}${labels}`;
  }

  expose(): string | undefined {
    if (this._value !== undefined) {
      return `${this.description} ${this._value}`;
    }
    return undefined;
  }

  labels(labels: Labels): Inc & Value {
    let child = new Counter(this.collector, this.labelNames);
    for (let key of Object.keys(labels)) {
      const index = child.labelNames.indexOf(key);
      if (index === -1) {
        throw new Error(`label with name ${key} not defined`);
      }
      child.labelValues[index] = labels[key];
    }
    child = child.collector.getOrSetMetric(child) as Counter;

    return {
      inc: (n: number = 1) => {
        child.inc(n);
      },
      value: () => {
        return child._value;
      },
    };
  }

  inc(n: number = 1) {
    if (n < 0) {
      throw new Error("it is not possible to deacrease a counter");
    }
    if (this._value === undefined) {
      this._value = 0;
    }
    this._value += n;
  }

  value(): number | undefined {
    return this._value;
  }
}
