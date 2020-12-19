import { Day } from "./day";

class Disc {
    constructor(public positions: number, public start: number) {}

    public getPositionAt(t: number) {
        return (this.start + t) % this.positions;
    }
}

export class Day15 extends Day {
    private rxDisc = /has (?<pos>\d+).+position (?<start>\d+)/;

    part1(): number {
        const discs = this.getDiscs();
        return this.getResult(discs);
    }

    part2(): number {
        const discs = this.getDiscs();
        discs.push(new Disc(11, 0));
        return this.getResult(discs);
    }

    private getResult(discs: Disc[]) {
        let start = -1;
        let found = false;
        while (!found) {
            start++;
            for (let i = 0; i < discs.length; i++) {
                found = true;
                if (discs[i].getPositionAt(start + i + 1) !== 0) {
                    found = false;
                    break;
                }
            }            
        }
        
        return start;
    }

    private getDiscs(): Disc[] {
        const discs: Disc[] = [];
        for (const line of this.fileContent) {
            const match = this.rxDisc.exec(line);
            discs.push(new Disc(
                parseInt(match!.groups!.pos, 10),
                parseInt(match!.groups!.start, 10),
            ));
        }
        return discs;
    }
}