import { AssembunnyInterpreterV3, InstructionV2, InstTypeV2 } from "./day23";
import { Day } from "./day";
import { exception } from "console";
import { Dict } from "../utils";


const InstTypeV4 = {
    ...InstTypeV2,
    OUT: 'out',
}

class InstructionV4 extends InstructionV2 {
    public constructor(
        protected interpreter: AssembunnyInterpreterV4,
        type: string,
        target1: string, 
        target2: string | null,
    ) {
        super(interpreter, type, target1, target2);
    }

    public execute() {
        switch (this.type) {
            case InstTypeV4.OUT:
                return this.out();
            default:
                return super.execute();
        }
    }

    private out() {
        const value = this.getValue(this.target1);
        this.interpreter.out(value);
    }
}

class AssembunnyInterpreterV4 extends AssembunnyInterpreterV3 {
    protected instructions: InstructionV4[] = [];
    protected instructionClass = InstructionV4;

    private expected = 0;
    private states: Dict<number> = {};

    public execute(): boolean {
        while (this.pointer < this.instructions.length) {
            const state = this.hash();
            if (!this.states[state]) {
                this.states[state] = 0;
            }
            this.states[state] += 1;

            if (this.states[state] === 5) {
                // loop encountered 5 times, no error in sequence: must be the result.
                return true;
            }

            this.instructions[this.pointer].execute();
            this.pointer++;
        }

        return false;
    }

    private hash() {
        return `${this.pointer},${this.registers.a},${this.registers.b},${this.registers.c},${this.registers.d}`;
    }

    public out(out: number) {
        if (out === this.expected) {
            this.expected = this.expected === 1 ? 0 : 1;
        } else {
            throw new Error('not the expected output');
        }
    }
}

export class Day25 extends Day {
    part1(): number {
        let counter = 0;
        while (true) {
            const interpreter = this.initInterpreter();
            interpreter.registers.a = counter;

            try {
                if (interpreter.execute()) {
                    return counter;
                }
            } catch {
                // sequence missed, try next
            }
            counter++;
        }
    }

    part2(): number {
        return 0;
    }

    private initInterpreter() {
        const interpreter = new AssembunnyInterpreterV4();
        for (const line of this.fileContent) {
            interpreter.addInstruction(line);
        }
        return interpreter;
    }
}