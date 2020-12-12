import fs from 'fs';
import { Day } from './days/day';


export class Runner {

    constructor(private day: number) { }

    public loadAndRun() {
        fs.readFile(`inputs/day${this.day}.txt`, (err, data)  => {
            if (err) {
                console.error(err);
                return;
            }
            this.run(data.toString().split('\n'));
        });
    }

    private run(data: string[]) {
        import(`./days/day${this.day}`).then(module => {
            const cls = module[`Day${this.day}`];
            const instance: Day = new cls(data);
            
            console.time('Part1');
            const result1 = instance.part1();
            console.timeEnd('Part1');
            console.log(result1);

            console.time('Part2');
            const result2 = instance.part2();
            console.timeEnd('Part2');
            console.log(result2);
        }, () => {
            console.error(`day ${this.day} not implemented!`);
        });
    }

}