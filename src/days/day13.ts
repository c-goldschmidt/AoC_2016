import { Day } from "./day";
import { dec2bin, Dict } from "../utils";
import { nodeModuleNameResolver } from "typescript";

class Point {
    public static code: number = -1;
    constructor(public x: number, public y: number) { };

    eq(other: Point) {
        return this.x === other.x && this.y === other.y;
    }

    dist(other: Point): number {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    get hash(): string {
        return this.x + '|' + this.y;
    }

    get valid(): boolean {
        if (this.x < 0 || this.y < 0) {
            return false;
        }
        let value = this.x * this.x + 3 * this.x + 2 * this.x * this.y + this.y + this.y * this.y;
        value += Point.code;
        return dec2bin(value).split('').filter(item => item === '1').length % 2 === 0;
    }

    public next() {
        return [
            new Point(this.x + 1, this.y),
            new Point(this.x, this.y + 1),
            new Point(this.x - 1 , this.y),
            new Point(this.x, this.y - 1),
        ].filter(point => point.valid);
    }
}

export class Day13 extends Day {

    part1(): number {
        Point.code = parseInt(this.fileContent[0], 10);
        const start = new Point(1, 1);
        const end = new Point(31, 39);
        return this.findPath(start, end);
    }

    part2(): number {
        return this.findLocations();
    }

    private findLocations() {
        const start = new Point(1, 1);
        const locations: string[] = [];

        for (let x = 0; x <= 50; x++) {
            for (let y = 0; y <= 50; y++) {
                const end = new Point(x, y);
                if (start.dist(end) > 50) {
                    // already fails for the optimistic heuristic path (straight(ish) line)
                    continue;
                }

                const path = this.findPath(start, end);
                if (path <= 50) {
                    locations.push(end.hash);
                }
            }
        }

        return locations.length;
    }

    // A*
    private findPath(start: Point, end: Point) {
        const prev: Dict<Point> = {};
        const gScore: Dict<number> = {};
        const fScore: Dict<number> = {};
        const queue: Point[] = [start];

        gScore[start.hash] = 0;
        fScore[start.hash] = start.dist(end);

        while (queue.length > 0) {
            const current = queue.reduce((acc, curr) => {
                return (!acc || fScore[acc.hash] > fScore[curr.hash]) ? curr : acc;
            }, null as Point | null);

            if (!current) {
                throw new Error('no current node');
            }

            if (current.eq(end)) {
                let dist = 0;
                let prevNode = current;
                while (!prevNode.eq(start)) {
                    dist++;
                    prevNode = prev[prevNode.hash];
                }
                return dist;
            }

            queue.splice(queue.indexOf(current), 1);
            for (const next of current.next()) {
                const nextGScore = gScore[current.hash] + 1;
                if (!gScore[next.hash] || nextGScore < gScore[next.hash]) {
                    prev[next.hash] = current;
                    gScore[next.hash] = nextGScore;
                    fScore[next.hash] = gScore[next.hash] + next.dist(end);

                    if (!queue.find(q => q.eq(next))) {
                        queue.push(next);
                    }
                }
            }
        }

        return Infinity;
    }
}