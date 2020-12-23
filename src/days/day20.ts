import { Day } from "./day";

export class Day20 extends Day {
    part1(): number {
        return this.getFirstValidIP();
    }

    part2(): number {
        return this.getValidCount();
    }

    private getFirstValidIP() {
        const max = Math.pow(2, 32);
        let blacklist = this.getBlackList();

        for (let i = 0; i < max; i++) {
            const entry = blacklist.find(item => item[0] === i);

            if (!entry) {
                return i as any;
            } else {
                blacklist = blacklist.filter(x => x !== entry);
                // skip to end of range
                i = entry[1];
            }
        }
    }

    private getBlackList() {
        return this.fileContent.map(line => {
            const split = line.split('-');
            return [parseInt(split[0], 10), parseInt(split[1], 10)];
        }).sort((a, b) => a[0] - b[0]);
    }

    private getValidCount(): number {
        const max = Math.pow(2, 32);
        let blacklist = this.getBlackList().reverse();

        let prevEnd = 0;
        let validStart = 0;
        let totalValid = 0;
        while (blacklist.length > 0) {
            const entry = blacklist.pop()!;

            if (prevEnd < entry[0]) {
                totalValid += (entry[0] - prevEnd - 1);
            }
            prevEnd = Math.max(entry[1], prevEnd);
        }
        return totalValid;
    }
}