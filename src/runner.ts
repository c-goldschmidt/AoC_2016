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
            
            console.log('===== Part 1 =====');
            console.time('Time');
            const result1 = instance.part1();
            console.timeEnd('Time');
            console.log('Result:', result1);
            console.log('');
            
            console.log('===== Part 2 =====');
            console.time('Time');
            const result2 = instance.part2();
            console.timeEnd('Time');
            console.log('Result:', result2);
        }, () => {
            console.error(`day ${this.day} not implemented!`);
        });
    }

}