import { Day } from "./day";

const elements: string[] = [];

export class Chip {
    public value: number;
    constructor(public element: string) {
        if (!elements.includes(element)) {
            elements.push(element);
        }
        this.value = elements.indexOf(element);
    }
}
export class Generator {
    public value: number;
    constructor(public element: string) {
        if (!elements.includes(element)) {
            elements.push(element);
        }
        this.value = -elements.indexOf(element);
    }
}
type Item = Generator | Chip;

export class Day11 extends Day {
    part1(): number {
        // return 0;
        const diagram = this.generateDiagram();
        return  this.findMinPath(diagram);
    }

    part2(): number {
        const diagram = this.generateDiagram();
        diagram[0].push(new Generator('elerium'));
        diagram[0].push(new Generator('dilithium'));
        diagram[0].push(new Chip('elerium'));
        diagram[0].push(new Chip('dilithium'));
        return this.findMinPath(diagram);
    }

    private findMinPath(start: Item[][]): number {
        const states: string[] = [];
        let queue: [number, number[][], number, string][] = [];

        const getHash = (elevator: number, floors: number[][]): string => {
            const floorData = floors.map(floor => [floor.length, floor.reduce((acc, curr) => acc + Number(curr < 0), 0)].join('/'));
            return `${elevator}[${floorData.join(',')}]`
        }

        const move = (elevator: number, floors: number[][], direction: number, fromIndex: number | null, toIndex: number | null) => {
            if (fromIndex !== null && toIndex !== null) {
                floors[elevator + direction].splice(toIndex, 0, floors[elevator][fromIndex]);
                floors[elevator].splice(fromIndex, 1);
            }

        }

        const isValidState = (floor: number[]): boolean => {
            const hasGen = floor.some(i => i < 0);
            const unpaired = floor.some(i => i > 0 && !floor.some(j => j === -i));
            return !(hasGen && unpaired);

        }

        const exploreState = (req: number, elevator: number, floors: number[][], direction: number, moves: number, index1: number, index2: number | null = null) => {
            if(direction * elevator < req) {
                move(elevator, floors, direction, index2, 0);
                move(elevator, floors, direction, index1, 0);
                const nextHash = getHash(elevator + direction, floors);

                if (!states.includes(nextHash) && floors[elevator + direction] && isValidState(floors[elevator + direction]) && isValidState(floors[elevator])) {
                    const floorsCopy = floors.map(floor => floor.slice());
			        queue.push([elevator + direction, floorsCopy, moves + 1, nextHash])
                }

                move(elevator + direction, floors, -direction, 0, index1)
		        move(elevator + direction, floors, -direction, 0, index2)
            }
        }

        const startNums = start.map(floor => floor.map(item => item.value));
        const endHash = getHash(3, [[], [], [], startNums.reduce((acc, curr) => acc.concat(curr), [])])
        queue.push([0, startNums, 0, getHash(0, startNums)])

        while (true) {
            const [elevator, floors, moves, currHash] = queue.shift()!;

            if (states.includes(currHash)) {
                continue;
            }

            states.push(currHash);
            if (currHash === endHash) {
                return moves;
            }

            for (let index1 = 0; index1 < floors[elevator].length; index1++) {
                for (let index2 = index1 + 1; index2 < floors[elevator].length; index2++) {
                    exploreState(3, elevator, floors, 1, moves, index1, index2);
                    exploreState(0, elevator, floors, -1, moves, index1, index2);
                }

                exploreState(3, elevator, floors, 1, moves, index1);
                exploreState(0, elevator, floors, -1, moves, index1);
            }
        }

        return Infinity;
    }

    private generateDiagram(): Item[][] {
        let floors = [];
        for (const line of this.fileContent) {
            floors.push(this.getGenerators(line).concat(this.getChips(line)));
        }
        return floors;
    }

    private getChips(line: string): Chip[] {
        const chips = [];
        const rxChip = / (\w+)-compatible microchip/gm;
        let match;

        while ((match = rxChip.exec(line)) !== null) {
            chips.push(new Chip(match[1]));
        }

        return chips;
    }

    private getGenerators(line: string): Generator[] {
        const generators = [];
        const rxGen = / (\w+) generator/g;
        let match;

        while ((match = rxGen.exec(line)) !== null) {
            generators.push(new Generator(match[1]));
        }

        return generators;
    }
}