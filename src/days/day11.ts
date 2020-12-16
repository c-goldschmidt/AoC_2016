import { Day } from "./day";
import { permutatons } from "../utils";

export class Chip {
    constructor(public element: string) {}
}
export class Generator {
    constructor(public element: string) {}
}
type Item = Generator | Chip;

class Node {
    private static index = 0;
    public id: number;

    constructor(public floorDiagram: Item[][], private totalItems: number) {
        this.id = Node.index++;
    }

    private get itemCount(): number {
        return this.floorDiagram.reduce((prev, floor) => prev + floor.length, 0);
    }

    public get isEnd() {
        return this.floorDiagram[this.floorDiagram.length - 1].length === this.totalItems;
    }

    public get valid() {
        if (this.itemCount !== this.totalItems) {
            return false;
        }

        let valid = true;
        this.floorDiagram.reduce((acc, curr) => {
            if (!valid || !Node.floorValid(curr)) {
                valid = false;
                return acc;
            }
            for (const item of curr) {
                if (acc.includes(item)) {
                    valid = false;
                }
            }
            return acc.concat(curr);
        }, []);

        return valid;
    }

    public static floorValid(items: Item[]) {
        const chips = items.filter(item => item instanceof Chip);
        const gens = items.filter(item => item instanceof Generator);
        
        for (let i = 0; i<chips.length; i++) {
            const chip = chips[i];
            const gen = gens.find(item => item.element === chip.element);
            if (gens.length > 0 && !gen) {
                // chip is fried
                return false;
            }
        }
        return true;
    }

    public equals(b: Item[][]): boolean {
        return this.floorDiagram.every((itemX, x) => itemX.every((itemY, y) => b[x][y] === itemY));
    }

    public canMoveTo(other: Node, currentFloor: number): [boolean, number] {
        const movable = permutatons(this.floorDiagram[currentFloor], 2, true);
        for (const move of movable) {
            if (!move.length) {
                continue;
            }


        }

        return [false, currentFloor];
    }
}


export class Day11 extends Day {
    part1(): number {
        const diagram = this.generateDiagram();
        const validStates = this.getValidStates(diagram);

        const start = validStates.find(state => state.equals(diagram));
        const end = validStates.find(state => state.isEnd);

        return this.findMinPath(start!, end!, validStates);
    }

    part2(): number {
        return 0;
    }

    private findMinPath(start: Node, end: Node, nodes: Node[], currentFloor = 0) {
        let minPath = Infinity;
        const otherNodes = nodes.filter(node => node.id != start.id);
        for (const other of otherNodes) {
            const [canMove, newFloor] = start.canMoveTo(other, currentFloor)
            if (!canMove) {
                continue;
            }

            if (other == end) {
                return 1;
            }

            const subLength = this.findMinPath(other, end, otherNodes, newFloor);
            if (subLength < minPath) {
                minPath = subLength;
            }
        }

        return minPath;
    }

    private getValidStates(diagram: Item[][]): Node[] {
        const allChips = diagram.reduce((prev, curr) => prev.concat(curr.filter(item => item instanceof Chip)), []);
        const allGens = diagram.reduce((prev, curr) => prev.concat(curr.filter(item => item instanceof Generator)), []);
        const totalItems = allChips.length + allGens.length;
        const allPerms: Item[][] = [];

        const perms = permutatons([...allChips, ...allGens], 4, true);
        for (const perm of perms) {
            if (!this.contains(allPerms, perm) && Node.floorValid(perm)) {
                allPerms.push(perm);
            }
        }

        for (const floor of diagram) {
            allPerms.push([]);
        }

        const validStates: Node[] = [];
        for (const state of permutatons(allPerms, diagram.length)) {
            const node = new Node(state, totalItems);
            if (node.valid) {
                validStates.push(node);
            }
        }
        return validStates;
    }

    private contains(list: Item[][], contained: Item[]): boolean {
        return list.reduce((prev: boolean, curr) => {
            return prev || (curr.length == contained.length && curr.every(item => contained.includes(item)));
        }, false);
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