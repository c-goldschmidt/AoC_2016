import { Day } from "./day";

export class Day8 extends Day {
    private rxRect = /rect (\d+)x(\d+)/;
    private rxRow = /rotate row y=(\d+) by (\d+)/;
    private rxCol = /rotate column x=(\d+) by (\d+)/;

    part1(): number {
        return this.count(this.getGrid());
    }

    part2(): string {
        return this.toString(this.getGrid());
    }

    private getGrid(): boolean[][] {
        const grid = this.createGrid(6, 50);
        for (const line of this.fileContent) {
            this.applyStep(grid, line);
        }
        return grid;
    }

    private toString(grid: boolean[][]): string {
        return grid.reduce((prev, row) =>  prev + row.map(col => col ? '#' : '.').join('.') + '\n', '\n');
    }

    private count(grid: boolean[][]): number {
        return grid.reduce((prev, row) =>  prev + row.filter(col => col).length, 0);
    }

    private applyStep(grid: boolean[][], input: string) {
        let match = this.rxRect.exec(input);
        if (match) {
            return this.drawRect(grid, parseInt(match[1], 10), parseInt(match[2], 10));
        }

        match = this.rxRow.exec(input);
        if (match) {
            return this.shiftRow(grid, parseInt(match[1], 10), parseInt(match[2], 10));
        }

        match = this.rxCol.exec(input);
        if (match) {
            return this.shiftColumn(grid, parseInt(match[1], 10), parseInt(match[2], 10));
        }
    }

    private shiftRow(grid: boolean[][], row: number, times: number) {
        const start = grid[row].splice(grid[row].length - times, times);
        grid[row] = start.concat(grid[row]);
    }

    private shiftColumn(grid: boolean[][], col: number, times: number) {
        let column = grid.map(row => row[col]);
        const start = column.splice(column.length - times, times);
        column = start.concat(column);

        grid.forEach((row, i) => {
            row[col] = column[i];
        });
    }

    private drawRect(grid: boolean[][], w: number, h: number) {
        for (let x = 0; x < h; x++) {
            for (let y = 0; y < w; y++) {
                grid[x][y] = true;
            }
        }
    }

    private createGrid(x: number, y: number): boolean[][] {
        return new Array(x).fill(null).map(row => new Array(y).fill(false));
    }
}