import { Day } from "./day";

export class Day3 extends Day {
    private rxNumbers = /^\s*(\d+)\s+(\d+)\s+(\d+)$/;

    part1(): number {
        let valid = 0;
        for (const line of this.fileContent) {
            let result = this.rxNumbers.exec(line);
            if (!result) {
                throw new Error("could not match");
            }

            valid += this.isValid([result[1], result[2], result[3]]) ? 1: 0;
        }
        return valid;
    }

    part2(): number {
        let valid = 0;
        for (let i = 0; i <= this.fileContent.length - 3; i += 3) {
            let line1 = this.rxNumbers.exec(this.fileContent[i]);
            let line2 = this.rxNumbers.exec(this.fileContent[i + 1]);
            let line3 = this.rxNumbers.exec(this.fileContent[i + 2]);

            if (!line1 || !line2 || !line3) {
                throw new Error("could not match");
            }

            valid += this.isValid([line1[1], line2[1], line3[1]]) ? 1: 0;
            valid += this.isValid([line1[2], line2[2], line3[2]]) ? 1: 0;
            valid += this.isValid([line1[3], line2[3], line3[3]]) ? 1: 0;
        }

        return valid;
    }

    private isValid(sides: string[]) {
        let intSides = sides.map(side => parseInt(side, 10));
        return (intSides[0] + intSides[1]) > intSides[2] &&
               (intSides[1] + intSides[2]) > intSides[0] &&
               (intSides[2] + intSides[0]) > intSides[1];
    }
}