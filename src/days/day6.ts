import { Day } from "./day";
import { Day4 } from "./day4";

export class Day6 extends Day {
    part1(): string {
        const columns = this.getInColumns();
        let result = '';
        for (const column of columns) {
            const counts = this.countLetters(column);
            result += counts[0][0];
        }

        return result;
    }

    part2(): string {
        const columns = this.getInColumns();
        let result = '';
        for (const column of columns) {
            const counts = this.countLetters(column);
            result += counts[counts.length - 1][0];
        }

        return result;
    }

    private getInColumns() {
        const columns: string[] = [];
        for (const line of this.fileContent) {
            const split = line.split('');
            for (let i = 0; i < split.length; i++) {
                columns[i] = columns.length > i ? columns[i] + split[i] : split[i];
            }
        }
        return columns;
    }

    private countLetters(data: string): [string, number][] {
        // same functionality already built. yay.
        const d4 = new Day4([]);
        return d4.countLetters(data);
    }
}