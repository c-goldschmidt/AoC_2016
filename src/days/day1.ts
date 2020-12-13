import { Day } from "./day";

export class Day1 extends Day {

    part1(): number {
        const directions = this.fileContent[0].split(', ');
        const position = [0, 0, 0, 0];  // N/E/S/W
        let currentDirection = 0;

        for (const direction of directions) {
            const value = parseInt(direction.split('').slice(1).join(''));
            currentDirection = this.getDirection(currentDirection, direction[0] === 'R');
            position[currentDirection] += value;
        }

        return Math.abs((position[0] - position[2])) + Math.abs((position[1] - position[3]));
    }

    part2(): number {
        const visited: [number, number][] = [];
        const directions = this.fileContent[0].split(', ');
        const position = [0, 0, 0, 0];  // N/E/S/W
        const prev = null;

        let currentDirection = 0;

        for (const direction of directions) {
            currentDirection = this.getDirection(currentDirection, direction[0] === 'R');
            const value = parseInt(direction.split('').slice(1).join(''));

            for (let i=0; i < value; i++) {
                position[currentDirection] += 1;
                const x = position[0] - position[2];
                const y = position[1] - position[3];

                if (visited.some(([otherX, otherY]) => otherX === x && otherY === y)) {
                    return Math.abs(x) + Math.abs(y);
                }

                visited.push([x, y]);
            }
        }

        return -1;
    }

    private getDirection(currentDirection: number, turnRight: boolean) {
        if (turnRight) {
            currentDirection++;
        } else {
            currentDirection--;
        }
        
        // modulo doesn't work with values < 0
        if (currentDirection < 0) {
            currentDirection = 3;
        }

        if (currentDirection > 3) {
            currentDirection = 0;
        }
        return currentDirection;
    }
}