import { Day } from "./day";

export class Day2 extends Day {
    part1(): string {
        const keypad = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
        ];
        return this.getForKeypad(keypad);
    }

    part2(): string {
        const keypad = [
            [undefined, undefined, '1', undefined, undefined],
            [undefined,  '2', '3', '4', undefined],
            [ '5', '6', '7', '8', '9'],
            [undefined,  'A', 'B', 'C', undefined],
            [undefined,  undefined, 'D', undefined, undefined],
        ];
        return this.getForKeypad(keypad);
    }

    private getForKeypad(keypad: (string|undefined)[][]): string {
        let vec = keypad.reduce((acc, value, index) => {
            if (acc[1] !== null && acc[1]! > - 1) {
                return acc;
            }
            return [index, value.indexOf('5')];
        }, [-1, -1]);
        
        let buttons = [];
        for (const line of this.fileContent) {
            for (const direction of line.split('')) {
                vec = this.move(vec, direction, keypad);
            }
            buttons.push(keypad[vec[0]][vec[1]]);
        }

        return buttons.join('');

    }

    private move(vec: number[], direction: string, keypad: (string|undefined)[][]):  number[] {
        var new_vec = vec;
        switch (direction) {
            case 'U':
                new_vec = [vec[0] - 1, vec[1]];
                break;
            case 'D':
                new_vec = [vec[0] + 1, vec[1]];
                break;
            case 'L':
                new_vec = [vec[0], vec[1] - 1];
                break;
            case 'R':
                new_vec = [vec[0], vec[1] + 1];
                break;
        }

        let valid: boolean;
        try {
            valid = keypad[new_vec[0]][new_vec[1]] !== undefined;
        } catch {
            valid = false;
        }

        return valid ? new_vec : vec;
    }
}