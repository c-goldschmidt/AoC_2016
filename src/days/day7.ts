import { LanguageServiceMode } from "typescript";
import { Day } from "./day";

export class Day7 extends Day {
    private rxABBA = /(\w)((?!\1)\w)\2\1/;

    part1(): number {
        let total = 0;
        for (const line of this.fileContent) {
            total += this.canTLS(line) ? 1 : 0;
        }

        return total;
    }

    part2(): number {
        let total = 0;
        for (const line of this.fileContent) {
            total += this.canSSL(line) ? 1 : 0;
        }
        return total;
    }

    private canSSL(input: string): boolean {
        let matches: string[] = [];
        const subLines = this.splitLine(input);

        subLines.filter(line => !line[0]).forEach((item) => {
            const comp = /(\w)((?!\1)\w)\1/g;
            let result = null;
            do {
                result = comp.exec(item[1]);
                if(result) {
                    matches.push(result[2] + result[1] + result[2])
                    comp.lastIndex -= 2; // match length is 3, to overlap, we need to go 2 chars back.
                }
            } while (result);
        });

        let foundInside = false;
        subLines.filter(line => line[0]).forEach((item) => {
            if (foundInside) {
                return;
            }

            for (const match of matches) {
                foundInside = foundInside || item[1].includes(match);
                if (item[1].includes(match)) {
                    return;
                }
            }
        });

        return foundInside;
    }

    private canTLS(line: string) {
        const subLines = this.splitLine(line);

        let hasAbbaOutside = false;
        let hasAbbaInside = false;
        for (const subLine of subLines) {
            hasAbbaInside = hasAbbaInside || (subLine[0] && this.containsAbba(subLine[1]));
            hasAbbaOutside = hasAbbaOutside || (!subLine[0] && this.containsAbba(subLine[1]));
        }

        return hasAbbaOutside && !hasAbbaInside;
    }

    private containsAbba(input: string): boolean {
        return this.rxABBA.test(input);
    }

    private splitLine(input: string): [boolean, string][] {
        const results: [boolean, string][] = [];
        input.split('[').forEach(item => {
            const subs = item.split(']');
            if (subs.length === 1) {
                results.push([false, subs[0]]);
            } else {
                results.push([true, subs[0]]);
                results.push([false, subs[1]]);
            }
        });
        return results;
    }
}