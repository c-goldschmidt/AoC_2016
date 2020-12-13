
export abstract class Day {
    constructor(protected fileContent: string[]) {}

    public abstract part1(): number | string;
    public abstract part2(): number | string;
}