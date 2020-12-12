
export abstract class Day {
    constructor(protected fileContent: string[]) {}

    public abstract part1(): number;
    public abstract part2(): number;
}