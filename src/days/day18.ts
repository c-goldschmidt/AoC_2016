import { Day } from "./day";

export class Day18 extends Day {
    part1(): number {
        const rows = [this.getFirstRow()];
        for (let i = 1; i < 40; i++) {
            rows.push(this.getNextRow(rows[i - 1]));
        }
        return this.countSafe(rows);
    }

    part2(): number {
        const rows = [this.getFirstRow()];
        for (let i = 1; i < 400000; i++) {
            rows.push(this.getNextRow(rows[i - 1]));
        }
        return this.countSafe(rows);
    }

    private countSafe(rows: boolean[][]) {
        return rows.reduce((acc, curr) => acc + curr.filter(x => !x).length, 0);
    }

    private getFirstRow() {
        return this.fileContent[0].split('').map(item => item === '^');
    }

    private getNextRow(row: boolean[]) {
        const nextRow: boolean[] = [];
        for (let i = 0; i < row.length; i++) {
            const center = row[i];
            const left = i === 0 ? false : row[i - 1];
            const right = i === row.length - 1 ? false : row[i + 1];
            
            nextRow.push([
                left && center && !right,
                center && right && !left,
                !center && !left && right,
                !center && !right && left,
            ].some(x => x))
        }
        return nextRow;
    }
}