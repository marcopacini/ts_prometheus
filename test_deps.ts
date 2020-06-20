import { Metric } from "./metric.ts";

export const test = Deno.test;

export {
  assert,
  assertEquals,
} from "https://deno.land/std@0.58.0/testing/asserts.ts";

export class MetricMock extends Metric {
  constructor(private labels: string) {
    super();
    this.labels = labels;
  }

  get description(): string {
    return this.labels.toString();
  }

  expose(): string {
    return this.labels.toString();
  }
}
