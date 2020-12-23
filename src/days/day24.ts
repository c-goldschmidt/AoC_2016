import { timeStamp } from "console";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";
import { Color, Dict, textColored } from "../utils";
import { Day } from "./day";

class Point {
    constructor(public y: number, public x: number) { }

    public eq(other: Point) {
        return this.x === other.x && this.y === other.y;
    }

    public dist(other: Point): number {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    get hash(): string {
        return this.x + '|' + this.y;
    }

    public next(maze: string[][]): Point[] {
        const nexPositions = [
            [this.y, this.x + 1],
            [this.y, this.x - 1],
            [this.y + 1, this.x],
            [this.y - 1, this.x,],
        ]
        const next = [];
        for (const pos of nexPositions) {
            if (maze[pos[0]][pos[1]] === '#') {
                continue;
            }

            if (maze[pos[0]][pos[1]] === '.') {
                next.push(new Point(pos[0], pos[1]));
            } else {
                next.push(new Poi(pos[0], pos[1], parseInt(maze[pos[0]][pos[1]])));
            }
        }
        return next;
    }
}

class Poi extends Point {
    constructor(x: number, y: number, public poiNum: number) { 
        super(x, y);
    }
}

class Path {
    private poisVisited: number[];

    constructor(
        private maze: string[][],
        private current: Point,
        private currentPath: Point[],
        private pois: Poi[],
        private returnToSender = false,
        private mustReturn = false,
    ) {
        this.poisVisited = [];
        
        for (const point of currentPath) {
            if ((point instanceof Poi) && !this.poisVisited.includes(point.poiNum)) {
                this.poisVisited.push(point.poiNum);
            }
        }
    }

    public get isEnd() {
        return this.pois.length === this.poisVisited.length && (
            !this.mustReturn || (this.current instanceof Poi && this.current.poiNum === 0)
        );
    }

    public get hash() {
        return this.currentPath.map(point => point.hash).join('/');
    }

    public get dist() {
        return this.currentPath.length - 1; // do not count start node as part of the path
    }

    public next() {
        // paths to other POIs
        let nextPoints = this.pois.filter(poi => !this.poisVisited.includes(poi.poiNum));
        let returnNext = this.returnToSender;
        let mustReturn = this.returnToSender;
        if (this.returnToSender && nextPoints.length === 0) {
            nextPoints = this.pois.filter(poi => poi.poiNum === 0);
            returnNext = false;
            mustReturn = true;
        }

        const result = [];
        for (const nextPoint of nextPoints) {
            if (nextPoint.eq(this.current)) {
                continue;
            }
            const subPath = this.getPathToNextPOI(nextPoint);
            result.push(new Path(
                this.maze,
                nextPoint,
                [...this.currentPath, ...subPath],
                this.pois,
                returnNext,
                mustReturn,
            ));
        }
        return result;
    }

    private getPathToNextPOI(end: Poi) {
        const prev: Dict<Point> = {};
        const gScore: Dict<number> = {};
        const fScore: Dict<number> = {};
        const queue: Point[] = [this.current];

        gScore[this.current.hash] = 0;
        fScore[this.current.hash] = this.current.dist(end);

        while (queue.length > 0) {
            const current = queue.reduce((acc, curr) => {
                return (!acc || fScore[acc.hash] > fScore[curr.hash]) ? curr : acc;
            }, null as Point | null);

            if (!current) {
                throw new Error('no current node');
            }

            if (current.eq(end)) {
                const path = [];
                let prevNode = current;
                while (!prevNode.eq(this.current)) {
                    path.unshift(prevNode);
                    prevNode = prev[prevNode.hash];
                }
                return path;
            }

            queue.splice(queue.indexOf(current), 1);
            for (const next of current.next(this.maze)) {
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

        throw new Error('no path found!');
    }
}

export class Day24 extends Day {

    part1(): number {
        //return 0;
        const maze = this.fileContent.map(item => item.split(''));
        const pois = this.getPois(maze);
        const poi0 = pois.find(p => p.poiNum === 0)!

        const start = new Path(maze, poi0, [poi0], pois);
        return this.getShortestPath(start).dist;
    }

    part2(): number {
        const maze = this.fileContent.map(item => item.split(''));
        const pois = this.getPois(maze);
        const poi0 = pois.find(p => p.poiNum === 0)!

        const start = new Path(maze, poi0, [poi0], pois, true);
        const path = this.getShortestPath(start);
        return path.dist;
    }


    private getPois(maze: string[][]): Poi[] {
        return maze.reduce((curr, row, y) => {
            const rowPois = row.map((col, x) => {
                const value = parseInt(col, 10);
                if (!isNaN(value)) {
                    return new Poi(y, x, value);
                }
                return null;
            }).filter(p => p !== null) as Poi[];
            return curr.concat(rowPois);
        }, [] as Poi[])!;
    }

    private getShortestPath(start: Path) {
        const prev: Dict<Path> = {};
        const gScore: Dict<number> = {};
        const fScore: Dict<number> = {};
        const queue: Path[] = [start];

        gScore[start.hash] = 0;
        fScore[start.hash] = start.dist;

        while (queue.length > 0) {
            const current = queue.reduce((acc, curr) => {
                return (!acc || fScore[acc.hash] > fScore[curr.hash]) ? curr : acc;
            }, null as Path | null);

            if (!current) {
                throw new Error('no current node');
            }

            if (current.isEnd) {
                return current;
            }

            queue.splice(queue.indexOf(current), 1);
            for (const next of current.next()) {
                const nextGScore = next.dist;
                if (!gScore[next.hash] || nextGScore < gScore[next.hash]) {
                    prev[next.hash] = current;
                    gScore[next.hash] = nextGScore;
                    fScore[next.hash] = nextGScore; // gScore[next.hash] + next.dist;

                    if (!queue.find(q => q.hash === next.hash)) {
                        queue.push(next);
                    }
                }
            }
        }

        throw new Error('no path found!');
    }
}
