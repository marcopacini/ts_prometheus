import { Collector } from './collector.ts'

export class Registry {
    // The default CollectorRegistry
    static default = new Registry();

    private collectors: Map<string, Collector>;
    
    constructor() {
        this.collectors = new Map()
    }

    register(collector: Collector) {
       const found = this.collectors.has(collector.name);
       if (found) {
           throw new Error(`a collector with name ${collector.name} has been registered`);
       }
       this.collectors.set(collector.name, collector);
    }

    unregister(collector: Collector) {
        this.collectors.delete(collector.name)
    }

    clear() {
        this.collectors = new Map()
    }

    metrics(): string {
        let text = ''
        for (let [name, collector] of this.collectors) {
            text += `# HELP ${collector.name} ${collector.help}\n`
            text += `# TYPE ${collector.name} ${collector.type}\n`
            for (let metric of collector.collect()) {
               text += metric.expose() + '\n'
            }
            text += '\n'
        }
        return text
    }
}