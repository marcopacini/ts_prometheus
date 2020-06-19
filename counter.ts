import { Collector } from './collector.ts';
import { Inc, Metric } from './metric.ts';

export class Counter extends Metric {
    private collector: Collector;
    private value: number;

    static with(config: { name: string, help: string, labels: string[] }): Counter {
        const collector = new Collector(config.name, config.help, 'counter');
        const labels = config.labels || []
        return new Counter(collector, labels);
    }

    private constructor(
        collector: Collector,
        labels: string[] = []
    ) {
        super(labels, new Array(labels.length).fill(undefined))
        this.collector = collector
        this.value = 0;
    }

    get description(): string {
        let labels = this.getLabelsAsString()
        return `${this.collector.name}${labels}`
    }

    expose(): string {
        return `${this.description} ${this.value}`
    }

    labels(labels: any): Inc {
        let child = new Counter(this.collector, this.labelNames)
        for (let key of Object.keys(labels)) {
            const index = child.labelNames.indexOf(key)
            if (index === -1) {
                throw new Error(`label with name ${key} not defined`)
            }
            child.labelValues[index] = labels[key]
        }
        child = child.collector.getOrSetMetric(child) as Counter

        return {
            inc: (n: number = 1) => {
                child.inc(n)
            }
        }
    }

    inc(n: number = 1) {
        if (n < 0) {
            throw new Error('it is not possible to deacrease a counter');
        }
        this.value += n;
    }
}