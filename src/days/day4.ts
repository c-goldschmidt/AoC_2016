import { chdir } from "process";
import { Day } from "./day";

interface CharCountDict {
    [index: string]: number;
}

interface LineMatch {
    content: string,
    num: number,
    chksum: string[],
}

export class Day4 extends Day {
    private rxData = /(?<content>[-a-z]+)-(?<num>\d+)\[(?<chksum>\w+)\]/;

    part1(): number {
        return this.getValidLines().reduce((prev, curr) => prev + curr.num, 0);
    }

    part2(): number {
        const lines = this.getValidLines();
        for (const line of lines) {
            if (this.decode(line) === 'northpole object storage') {
                return line.num;
            }
        }

        return -1;
    }

    private decode(lineMatch: LineMatch): string {
        const start = 'a'.charCodeAt(0);
        const end = 'z'.charCodeAt(0) + 1;

        let result = '';
        for (const letter of lineMatch.content.split('')) {
            if (letter == '-') {
                result += ' ';
                continue;
            }
            
            const code = (((letter.charCodeAt(0) - start) + lineMatch.num) % (end - start)) + start;
            result += String.fromCharCode(code);
        }
        return result;
    }

    public countLetters(data: string): [string, number][] {
        const chars: CharCountDict = {};

        for (const char of data.split('')) {
            if (char == '-') {
                continue;
            }
            chars[char] = chars[char] ? chars[char] + 1 : 1;
        }

        const asPairs: [string, number][] = [];
        for (const key in chars) {
            asPairs.push([key, chars[key]]);
        }

        asPairs.sort((a, b) => {
            const diff = b[1] - a[1];
            return diff !== 0 ? diff : a[0].localeCompare(b[0]);
        });

        return asPairs;
    }

    private getValidLines(): LineMatch[] {
        const valid: LineMatch[] = [];
        for (const line of this.fileContent) {
            let data = this.rxData.exec(line);
            if (!data) {
                throw new Error("could not match");
            }

            const lineMatch: LineMatch = {
                num: parseInt(data.groups!.num),
                content: data.groups!.content,
                chksum: data.groups!.chksum.split(''),
            }
            
            const letterCounts = this.countLetters(lineMatch.content);
            if (this.isValid(lineMatch.chksum, letterCounts)) {
                valid.push(lineMatch);
            }
        }
        return valid;
    }

    private isValid(checksum: string[], letterCounts: [string, number][]) {
        for (let i = 0; i < checksum.length; i++) {
            if (checksum[i] != letterCounts[i][0]) {
                return false;
            }
        }
        return true;
    }
}