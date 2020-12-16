import { Day } from "./day";

class Bin {
    constructor (private value: number) { }
    public getValue(_from: Bot | Output) {
        return this.value;
    }
}

class Output {
    private source?: Bot | Bin;

    constructor(public id: number) {}

    public addSource(source: Bot | Bin) {
        this.source = source;
    }

    public getValue() {
        return this.source!.getValue(this);
    }
}

class Bot {
    private source1?: Bot | Bin;
    private source2?: Bot | Bin;
    public targetLow?: Bot | Output;
    public targetHigh?: Bot | Output;

    private cacheHigh?: number;
    private cacheLow?: number;

    constructor(public id: number) {}

    public getValue(from: Bot | Output): number {
        if (this.targetLow && this.targetLow.id === from.id) {
            return this.cacheLow || this.getLowValue();
        } else if (this.targetHigh && this.targetHigh.id === from.id) {
            return this.cacheHigh || this.getHighValue();
        }
        return NaN;
    }

    public getComparing() {
        return [this.cacheLow || this.getLowValue(), this.cacheHigh || this.getHighValue()];
    }

    public sources() {
        const sources = [];
        if (this.source1! instanceof Bot) {
            sources.push(`Bot#${this.source1.id}`)
        } else {
            sources.push(`Bin: ${this.source1!.getValue(this)}`)
        }

        if (this.source2! instanceof Bot) {
            sources.push(`Bot#${this.source2.id}`)
        }else {
            sources.push(`Bin: ${this.source2!.getValue(this)}`)
        }
        return sources;
    }

    public addSource(source: Bot | Bin) {
        if (!this.source1) {
            this.source1 = source;
        } else {
            this.source2 = source;
        }
    }

    private getLowValue() {
        const value1 = this.source1!.getValue(this);
        const value2 = this.source2!.getValue(this);
        this.cacheLow = value1 > value2 ? value2 : value1;
        return this.cacheLow;
    }

    private getHighValue() {
        const value1 = this.source1!.getValue(this);
        const value2 = this.source2!.getValue(this);
        this.cacheHigh = value1 > value2 ? value1 : value2;
        return this.cacheHigh;
    }

    public setTarget(high: boolean, bot: Bot) {
        if (high) {
            this.targetHigh = bot;
        } else {
            this.targetLow = bot;
        }
    }
}

export class Day10 extends Day {
    private rxFill = /value (\d+) goes to bot (\d+)/;
    private rxGive = /bot (\d+) gives low to (output|bot) (\d+) and high to (output|bot) (\d+)/;

    part1(): number {
        const [bots] = this.getBotNet();

        for (const bot of bots) {
            const comparing = bot.getComparing();
            if (comparing[0] === 17 && comparing[1] === 61) {
                return bot.id;
            }
        }
        return -1;
    }

    part2(): number {
        const [_, outputs] = this.getBotNet();
        return outputs[0].getValue() * outputs[1].getValue() * outputs[2].getValue();
    }

    private getBotNet(): [Bot[], Output[]] {
        const bots: Bot[] = [];
        const outputs: Output[] = [];

        for (const line of this.fileContent) {
            let match = this.rxFill.exec(line);
            if (match) {
                const bot = parseInt(match[2], 10);
                const value = parseInt(match[1], 10);
                if (!bots[bot]) {
                    bots[bot] = new Bot(bot);
                }
                bots[bot].addSource(new Bin(value));
                continue;
            }

            match = this.rxGive.exec(line);
            if (match) {
                const bot = parseInt(match[1], 10);
                const target1 = this.addTarget(bots, outputs, match, 2);
                const target2 = this.addTarget(bots, outputs, match, 4);

                bots[bot].targetLow = target1;
                bots[bot].targetHigh = target2;
            }
        }
        return [bots, outputs];
    }

    private addTarget(bots: Bot[], outputs: Output[], match: RegExpExecArray, index: number) {
        const bot = parseInt(match[1], 10);
        const target = parseInt(match[index + 1], 10);
        
        if (!bots[bot]) {
            bots[bot] = new Bot(bot);
        }

        if (match[index] === 'output') {
            outputs[target] = new Output(target);
            outputs[target].addSource(bots[bot]);
            return outputs[target];
        } else {
            if (!bots[target]) {
                bots[target] = new Bot(target);
            }
            bots[target].addSource(bots[bot]);
            return bots[target];
        }
        
    }
}