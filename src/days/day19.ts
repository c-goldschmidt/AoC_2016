import { Day } from "./day";

class ListElement {
    constructor(public index: number, public prev?: ListElement, public next?: ListElement) { }
}

class ElfShelf {
    protected indices: (number | null)[];
    protected turn = 0;
    protected numNull = 0;

    constructor(size: number) {
        this.indices = new Array(size).fill(null).map((_, i) => i);
    }

    public run() {
        while (this.indices.length > 1) {
            this.tick();
        }
        return this.indices[0]! + 1;
    }

    protected tick() {
        for (let i = 0; i < this.indices.length; i++) {
            if (this.indices[i] === null) {
                continue;
            }
            this.indices[(i + 1) % (this.indices.length)] = null;
        }
        this.indices = this.indices.filter(x => x !== null);
    }
}

export class Day19 extends Day {
    part1(): number {
        const shelf = new ElfShelf(parseInt(this.fileContent[0], 10));
        return shelf.run();
    }

    part2(): number {
        // stole this one off of reddit...my idea was to do basically the same as above,
        // and the solution i came up with would have worked but was extremely slow,
        // due to the fact that array.splice() is extremely slow...
        const numElves = parseInt(this.fileContent[0], 10)
        let winner = 1;

        for (let i = 1; i < numElves; i++) {
            winner = winner % i + 1;
            if (winner > (i + 1)/2) {
                winner++;
            }
        }
        return winner;
    }
}