import { Day } from "./day";

export class Day9 extends Day {
    private rxSequence = /\((\d+)x(\d+)\)/;
    part1(): number {
        return this.decompressedLength(this.fileContent[0]);
    }

    part2(): number {
        return this.decompressedLength(this.fileContent[0], true);
    }

    private decompressedLength(input: string, recurse = false): number {
        const value = input.split('')
        let result = 0;

        for (let i = 0; i < value.length; i++) {
            if (value[i] == '(') {
                // sequence start
                const match = this.rxSequence.exec(input.slice(i));
                const len = parseInt(match![1])
                const repeat = parseInt(match![2])
                const matchLen = match![0].length;

                const content = value.slice(i + matchLen, i + matchLen + len).join('');
                let contentLen = content.length;
                if (recurse) {
                    contentLen = this.decompressedLength(content, true);
                }

                console.debug(content.length, repeat, content.length * repeat);
                result += contentLen * repeat;
                i += matchLen + len - 1;
            } else {
                result += 1;
            }
        }

        return result;
    }
}