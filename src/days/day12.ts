import { Day } from "./day";

export enum InstType {
    CPY = 'cpy',
    INC = 'inc',
    DEC = 'dec',
    JNZ = 'jnz',
}

interface Registers {
    a: number;
    b: number;
    c: number;
    d: number;
}

class Instruction {
    public static create(interpreter: AssembunnyInterpreter, match: RegExpExecArray) {
        return new Instruction(
            interpreter,
            match.groups!.cmd as InstType,
            match.groups!.target1,
            match.groups!.target2,
        )
    }

    private constructor(
        private interpreter: AssembunnyInterpreter,
        private type: InstType,
        private target1: string, 
        private target2: string | null,
    ) { }

    execute() {
        switch (this.type) {
            case InstType.CPY:
                return this.copy();
            case InstType.INC:
                return this.inc();
            case InstType.DEC:
                return this.dec();
            case InstType.JNZ:
                return this.jnz();
        }
    }

    private copy() {
        const parsed = parseInt(this.target1, 10);
        if (!isNaN(parsed)) {
            this.interpreter.registers[this.target2! as keyof Registers] = parsed;
        } else {
            this.interpreter.registers[this.target2! as keyof Registers] = this.interpreter.registers[this.target1 as keyof Registers];
        }
    }

    private inc() {
        this.interpreter.registers[this.target1 as keyof Registers]++;
    }
    
    private dec() {
        this.interpreter.registers[this.target1 as keyof Registers]--;
    }

    private jnz() {
        const val = this.interpreter.registers[this.target1 as keyof Registers];
        if (val !== 0) {
            this.interpreter.pointer += parseInt(this.target2!, 10) - 1;
        }
    }
}

class AssembunnyInterpreter {
    private rxInstruction = /(?<cmd>\w+) (?<target1>\w+) ?(?<target2>-?\w+)?/;
    private instructions: Instruction[] = [];

    public pointer = 0;
    public registers: Registers = {a: 0, b: 0, c: 0, d: 0}

    constructor() { }

    public execute() {
        while (this.pointer < this.instructions.length) {
            this.instructions[this.pointer].execute();
            this.pointer += 1;
        }
    }

    public addInstruction(inst: string) {
        const match = this.rxInstruction.exec(inst);
        if (!match) {
            throw Error('invalid instruction: ' + inst);
        }

        this.instructions.push(Instruction.create(this, match));
    }
}

export class Day12 extends Day {
    part1(): number {
        const interpreter = this.getInterpreter();
        interpreter.execute();
        return interpreter.registers.a;
    }

    part2(): number {
        const interpreter = this.getInterpreter();
        interpreter.registers.c = 1;
        interpreter.execute();
        return interpreter.registers.a;
    }

    private getInterpreter() {
        const interpreter = new AssembunnyInterpreter();
        for (const line of this.fileContent) {
            interpreter.addInstruction(line);
        }
        return interpreter;
    }
}