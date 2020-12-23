import { AssembunnyInterpreter, Instruction, InstType, Registers } from "./day12";
import { Day } from "./day";

export const InstTypeV2 = {
    ...InstType,
    TGL: 'tgl',
}

export class InstructionV2 extends Instruction {
    public toggled = false;

    public constructor(
        protected interpreter: AssembunnyInterpreterV2,
        type: string,
        target1: string, 
        target2: string | null,
    ) {
        super(interpreter, type, target1, target2);
    }

    public execute() {
        if (this.toggled) {
            return this.executeToggled();
        }

        switch (this.type) {
            case InstTypeV2.TGL:
                return this.tgl();
            default:
                return super.execute();
        }
    }

    public executeToggled() {
        switch (this.type) {
            case InstTypeV2.CPY:
                return this.jnz();
            case InstTypeV2.JNZ:
                return this.copy();
            case InstTypeV2.INC:
                return this.dec();
            case InstTypeV2.DEC:
            case InstTypeV2.TGL:
                return this.inc();
        }
    }

    public toString() {
        let result = `${this.type} ${this.target1}`;
        if (this.target2) {
            result += ` ${this.target2}`
        }
        return result;
    }

    private tgl() {
        const value = this.getValue(this.target1);
        const ptr = this.interpreter.pointer + value;
        const inst = this.interpreter.getInstruction(ptr);
        if (inst) {
            inst.toggled = true;
        }
    }

    protected copy() {
        const parsed = parseInt(this.target2!, 10);
        if (!isNaN(parsed)) {
            return;
        }
        return super.copy();
    }
}

class AssembunnyInterpreterV2 extends AssembunnyInterpreter {
    protected instructions: InstructionV2[] = [];
    protected instructionClass = InstructionV2;

    public getInstruction(ptr: number): InstructionV2 | null{
        if (ptr < 0 || ptr >= this.instructions.length) {
            return null;
        }
        return this.instructions[ptr];
    }
}

class Mul extends InstructionV2 {
    constructor(
        protected interpreter: AssembunnyInterpreterV2,
        type: string,
        target1: string, 
        protected target2: string,
        private target3: string,
    ) {
        super(interpreter, type, target1, target2);
    }

    execute() {
        const t1 = this.getValue(this.target1);
        const t2 = this.getValue(this.target2);

        this.interpreter.registers[this.target3 as keyof Registers] = t1 * t2;
    }
}

export class AssembunnyInterpreterV3 extends AssembunnyInterpreterV2 {
    protected optimize() {
        /*
        replace a long loop with a multiply, doing the same in far less iterations:

        inc target
        dec b
        jnz b -2
        dec a
        jnz a -5
        = mul a b target
        */

        for (let i=0; i < this.instructions.length - 4; i++) {
            let match = /inc (\w)/.exec(this.instructions[i].toString());
            if (!match) {
                continue;
            }
            const target = match[1];
            match = /dec (\w)/.exec(this.instructions[i + 1].toString());
            if (!match) {
                continue;
            }
            const b = match[1];

            match = /jnz (\w) -2/.exec(this.instructions[i + 2].toString());
            if (!match || match[1] !== b) {
                continue;
            }

            match = /dec (\w)/.exec(this.instructions[i + 3].toString());
            if (!match) {
                continue;
            }

            const a = match[1];
            match = /jnz (\w) -5/.exec(this.instructions[i + 4].toString());
            if (!match || match[1] !== a) {
                continue;
            }

            this.instructions[i] = new Mul(this, 'mul', a, b, target);
            this.instructions[i + 1] = new InstructionV2(this, 'cpy', '0', a);
            this.instructions[i + 2] = new InstructionV2(this, 'cpy', '0', b);
            this.instructions[i + 3] = new InstructionV2(this, 'jnz', '0', '0');
            this.instructions[i + 4] = new InstructionV2(this, 'jnz', '0', '0');
        }
    }

    public execute() {
        this.optimize();
        super.execute();
    }
}

export class Day23 extends Day {
    part1(): number {
        const interpreter = this.initInterpreter(new AssembunnyInterpreterV2());
        interpreter.registers.a = 7;
        interpreter.execute();
        return interpreter.registers.a;
    }

    part2(): number {
        const interpreter = this.initInterpreter(new AssembunnyInterpreterV3());
        interpreter.registers.a = 12;
        interpreter.execute();
        return interpreter.registers.a;
    }

    private initInterpreter(interpreter: AssembunnyInterpreter) {
        for (const line of this.fileContent) {
            interpreter.addInstruction(line);
        }
        return interpreter;
    }
}