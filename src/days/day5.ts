import { Day } from "./day";
import { Md5 } from 'ts-md5/dist/md5'

export class Day5 extends Day {

    getNextChar(i = 0): [string, number] {
        let found = false;
        let hash = null;
        while (!found) {
            hash = Md5.hashAsciiStr(this.fileContent[0] + i) as string;
            found = hash.startsWith('00000')
            i += 1;
        }
        return [hash!, i]
    }

    part1(): string {
        let pass = '';
        let index = 0;
        for (let i = 0; i < 8; i++) {
            const [hash, newIndex] = this.getNextChar(index);
            index = newIndex;
            pass += hash[5];
        }
        return pass;
    }

    part2(): string {
        let pass: string[] = ['_', '_', '_', '_', '_', '_', '_', '_'];
        let index = 0;
        let found = false;

        process.stdout.write('decoding: => ' + pass.join(''));
        while (!found) {
            const [hash, newIndex] = this.getNextChar(index);
            index = newIndex;

            let passIndex = parseInt(hash[5]);
            if (passIndex >= 0 && passIndex < 8 && pass[passIndex] === '_') {
                pass[passIndex] = hash[6];
                found = pass.filter(item => item != '_').length == 8;

                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write('decoding: => ' + pass.join(''));
            }
        }

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        return pass.join('');
    }
}