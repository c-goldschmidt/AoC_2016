import { exception } from "console";
import { Day } from "./day";

export interface InstType {
    [index: string]: string;
}

export const InstType = {
    CPY: 'cpy',
    INC: 'inc',
    DEC: 'dec',
    JNZ: 'jnz',
}

export interface Registers {
    a: number;
    b: number;
    c: number;
    d: number;
}

export class Instruction {
    public static create(interpreter: AssembunnyInterpreter, match: RegExpExecArray) {
        return new this(
            interpreter,
            match.groups!.cmd,
            match.groups!.target1,
            match.groups!.target2,
        )
    }

    protected constructor(
        protected interpreter: AssembunnyInterpreter,
        protected type: string,
        protected target1: string, 
        protected target2: string | null,
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
            default:
                throw new Error(`Unknown instruction type: ${this.type}`)
        }
    }

    protected getValue(target: string) {
        let value = parseInt(target, 10);
        if (isNaN(value)) {
            value = this.interpreter.registers[target as keyof Registers];
        }
        return value;
    }

    protected copy() {
        this.interpreter.registers[this.target2! as keyof Registers] = this.getValue(this.target1);
    }

    protected inc() {
        this.interpreter.registers[this.target1 as keyof Registers]++;
    }
    
    protected dec() {
        this.interpreter.registers[this.target1 as keyof Registers]--;
    }

    protected jnz() {
        const val = this.getValue(this.target1);
        if (val !== 0) {
            const ptr = this.getValue(this.target2!);
            this.interpreter.pointer += ptr - 1;
        }
    }
}

export class AssembunnyInterpreter {
    private rxInstruction = /(?<cmd>\w+) (?<target1>-?\w+) ?(?<target2>-?\w+)?/;
    protected instructions: Instruction[] = [];
    protected instructionClass = Instruction;

    public pointer = 0;
    public registers: Registers = {a: 0, b: 0, c: 0, d: 0}

    constructor() { }

    public execute() {
        while (this.pointer < this.instructions.length) {
            // console.log(this.pointer);
            this.instructions[this.pointer].execute();
            this.pointer++;
        }
    }

    public addInstruction(inst: string) {
        const match = this.rxInstruction.exec(inst);
        if (!match) {
            throw Error('invalid instruction: ' + inst);
        }

        this.instructions.push(this.instructionClass.create(this, match));
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