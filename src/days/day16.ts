import { Day } from "./day";

export class Day16 extends Day {
    part1(): string {
        const a = this.expand(this.fileContent[0], 272);
        return  this.checksum(a);
    }

    part2(): string {
        const a = this.expand(this.fileContent[0], 35651584);
        return  this.checksum(a);
    }

    private expand(a: string, len: number) {
        while (a.length < len) {
            let b = a.split('').reverse().join('');
            b = b.replace(/0/g, 'X');
            b = b.replace(/1/g, '0');
            b = b.replace(/X/g, '1');
            a = a + '0' + b;
        }
        return a.substr(0, len);
    }

    private checksum(a: string) {
        let checksum = a;
        while (checksum.length % 2 === 0) {
            const split = checksum.split('');
            checksum = '';
            for (let i = 0; i < split.length - 1; i += 2) {
                checksum += split[i] === split[i + 1] ? '1' : '0';
            }
        }
        return checksum;
    }
}