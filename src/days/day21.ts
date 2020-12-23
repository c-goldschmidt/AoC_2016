import { exception } from "console";
import { Day } from "./day";

class Scrambler {
    private data: string[];
    constructor(password: string) {
        this.data = password.split('');
    }

    public get password() {
        return this.data.join('');
    }

    public run(instruction: string) {
        let match = /swap position (\d+) with position (\d+)/.exec(instruction);
        if (match) {
            this.swap(parseInt(match[1], 10), parseInt(match[2], 10));
            return;
        }

        match = /swap letter (\w) with letter (\w)/.exec(instruction);
        if (match) {
            this.swapLetter(match[1], match[2]);
            return;
        }

        match = /rotate (left|right) (\d+) steps?/.exec(instruction);
        if (match) {
            this.rotate(match[1], parseInt(match[2], 10));
            return;
        }

        match = /rotate based on position of letter (\w+)/.exec(instruction);
        if (match) {
            this.rotateForLetter(match[1]);
            return;
        }

        match = /reverse positions (\d+) through (\d+)/.exec(instruction);
        if (match) {
            this.reverse(parseInt(match[1], 10), parseInt(match[2], 10));
            return;
        }

        match = /move position (\d+) to position (\d+)/.exec(instruction);
        if (match) {
            this.move(parseInt(match[1], 10), parseInt(match[2], 10));
            return;
        }

        throw new Error(`could not match: ${instruction}`);
    }

    public runReverse(instruction: string) {
        let match = /move position (\d+) to position (\d+)/.exec(instruction);
        if (match) {
            this.move(parseInt(match[2], 10), parseInt(match[1], 10));
            return;
        }

        match = /rotate based on position of letter (\w+)/.exec(instruction);
        if (match) {
            this.reverseRotationForLetter(match[1]);
            return;
        }

        match = /rotate (left|right) (\d+) steps?/.exec(instruction);
        if (match) {
            const direction = match[1] === 'right' ? 'left' : 'right';
            this.rotate(direction, parseInt(match[2], 10));
            return;
        }

        // the other insturctions are the same in both directions
        this.run(instruction);
    }


    private swap(x: number, y: number) {
        let tmp = this.data[x];
        this.data[x] = this.data[y];
        this.data[y] = tmp;
    }

    private swapLetter(x: string, y: string) {
        const index1 = this.data.findIndex(letter => letter == x);
        const index2 = this.data.findIndex(letter => letter == y);
        this.swap(index1, index2);
    }

    public rotate(direction: string, steps: number) {
        for (let i = 0; i < steps; i++) {
            if (direction === 'right') {
                const popped = this.data.pop()!;
                this.data.unshift(popped);
            } else {
                const popped = this.data.shift()!;
                this.data.push(popped);
            }
        }
    }

    public rotateForLetter(x: string) {
        const index = this.data.findIndex(letter => letter == x) ;
        let rotations = index + 1;
        rotations += index >= 4 ? 1 : 0;
        this.rotate('right', rotations);
    }

    private reverseRotationForLetter(x: string) {
        // there's probably some better way, but the password is short, so brute force is no problem...

        for(let i = 0; i < this.password.length; i++) {
            const other = new Scrambler(this.password);
            other.rotate('left', i);
            other.rotateForLetter(x);
            if (other.password === this.password) {
                this.rotate('left', i);
                return;
            }
        }
    }

    private reverse(start: number, end: number) {
        const before = this.data.slice(0, start);
        const after = this.data.slice(end + 1);
        const toReverse = this.data.slice(start, end + 1);
        this.data = [...before, ...toReverse.reverse(), ...after];
    }

    private move(x: number, y: number) {
        const removed = this.data.splice(x, 1)[0];
        this.data.splice(y, 0, removed);
    }
}

export class Day21 extends Day {
    part1(): string {
        const scrambler = new Scrambler('abcdefgh');
        for (const line of this.fileContent) {
            scrambler.run(line);
        }
        return scrambler.password;
    }

    part2(): string {
        const scrambler = new Scrambler('fbgdceah');
        for (let i = this.fileContent.length - 1; i >= 0; i--) {
            scrambler.runReverse(this.fileContent[i]);
        }
        return scrambler.password;
    }
}