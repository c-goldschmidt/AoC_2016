import { Runner } from "./runner";

const dayNum = parseInt(process.argv[2]);

if (!isNaN(dayNum)) {
    const runner = new Runner(dayNum);
    runner.loadAndRun();
}
