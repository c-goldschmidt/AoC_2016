import { Md5 } from "ts-md5";
import { Dict } from "../utils";
import { Day } from "./day";

class State {
    private static DIRECTIONS = ['U', 'D', 'L', 'R'];
    private keyHash: string; 

    constructor(private key: string, public path: string, private location: [number, number]) {
        this.keyHash = (Md5.hashAsciiStr(this.key + this.path) as string).substr(0, 4);
    }

    public get hash() : string {
        return [this.keyHash, ...this.location].join('/');
    }

    public next(): State[] {
        const directions: State[] = [];
        this.keyHash.split('').forEach((chr, index) => {
            if (this.directionPossible(State.DIRECTIONS[index]) && /[bcdef]/.test(chr)) {
                directions.push(new State(
                    this.key,
                    this.path + State.DIRECTIONS[index],
                    this.newLocation(State.DIRECTIONS[index]),
                ));
            }
        });
        return directions;
    }

    public dist() {
        return (3 - this.location[0]) + (3 - this.location[1]);
    }

    public get isGoal() {
        return this.location[0] === 3 && this.location[1] === 3;
    }

    private newLocation(direction: string): [number, number] {
        switch (direction) {
            case 'U':
                return [this.location[0] - 1, this.location[1]];
            case 'D':
                return [this.location[0] + 1, this.location[1]];
            case 'L':
                return [this.location[0], this.location[1] - 1];
            case 'R':
                return [this.location[0], this.location[1] + 1];
                default:
                    throw new Error('invalid direction');

        }
    }

    private directionPossible(direction: string): boolean {
        switch (direction) {
            case 'U':
                return this.location[0] > 0;
            case 'D':
                return this.location[0] < 3;
            case 'L':
                return this.location[1] > 0;
            case 'R':
                return this.location[1] < 3;
            default:
                throw new Error('invalid direction');
        }
    }

}

export class Day17 extends Day {
    part1(): string {
        const state = new State(this.fileContent[0], '', [0, 0]);
        return this.findPath(state);
    }

    part2(): number {
        const state = new State(this.fileContent[0], '', [0, 0]);
        return this.findLongestPath(state).length;
    }

    // kind of a reverse A*
    private findLongestPath(start: State) {
        const prev: Dict<State> = {};
        const gScore: Dict<number> = {};
        const fScore: Dict<number> = {};
        const queue: State[] = [start];

        gScore[start.hash] = 0;
        fScore[start.hash] = start.dist();

        let current: State;
        let currentLongest = '';
        while (queue.length > 0) {
            current = queue.reduce((acc, curr) => {
                return (!acc || fScore[acc.hash] < fScore[curr.hash]) ? curr : acc;
            }, null as State | null)!;
            queue.splice(queue.indexOf(current), 1);

            if (current.isGoal) {
                if (current.path.length > currentLongest.length) {
                    currentLongest = current.path;
                }
                continue;
            }

            for (const next of current.next()) {
                const nextGScore = gScore[current.hash] + 1;
                if (!gScore[next.hash] || nextGScore > gScore[next.hash]) {
                    prev[next.hash] = current;
                    gScore[next.hash] = nextGScore;
                    fScore[next.hash] = gScore[next.hash] + next.dist();

                    if (!queue.find(q => q.hash === next.hash)) {
                        queue.push(next);
                    }
                }
            }
        }

        return currentLongest;

    }

    // again A*
    private findPath(start: State): string {
        const prev: Dict<State> = {};
        const gScore: Dict<number> = {};
        const fScore: Dict<number> = {};
        const queue: State[] = [start];

        gScore[start.hash] = 0;
        fScore[start.hash] = start.dist();

        while (queue.length > 0) {
            const current = queue.reduce((acc, curr) => {
                return (!acc || fScore[acc.hash] > fScore[curr.hash]) ? curr : acc;
            }, null as State | null);

            if (!current) {
                throw new Error('no current node');
            }

            if (current.isGoal) {
                return current.path;
            }

            queue.splice(queue.indexOf(current), 1);
            for (const next of current.next()) {
                const nextGScore = gScore[current.hash] + 1;
                if (!gScore[next.hash] || nextGScore < gScore[next.hash]) {
                    prev[next.hash] = current;
                    gScore[next.hash] = nextGScore;
                    fScore[next.hash] = gScore[next.hash] + next.dist();

                    if (!queue.find(q => q.hash === next.hash)) {
                        queue.push(next);
                    }
                }
            }
        }

        return 'not found';
    }
}