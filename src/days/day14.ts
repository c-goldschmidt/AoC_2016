import { Md5 } from "ts-md5";
import { WorkerPool } from "../workers/pool";
import { Day } from "./day";

class Key {
    constructor(public index: number, public hash: string) {};
}

export class Day14 extends Day {
    private key = this.fileContent[0];

    private async runBatch(startI: number, stretch: boolean, found: number[]): Promise<number> {
        const pool = new WorkerPool(8, './build/workers/hashWorker.js');
        const shedule = (i: number, match: RegExpExecArray) => {
            const search = match[1];
            pool.run<any, number | null>({key: this.key, i, search, stretch}).then((result: number | null) => {
                if (result) {
                    found.push(result);
                }
            });
        }

        for (let i = 0; i < 1000; i++) {
            let hash = Md5.hashAsciiStr(this.key + (startI + i)) as string;
            if (stretch) {
                hash = this.stretch(hash);
            }
            let match = /(\w)\1{2}/.exec(hash);
            if (match) {
                shedule(startI + i, match);
            }
        }

        await pool.syncAndStop();
        if (!found[63]) {
            return await this.runBatch(startI + 1000, stretch, found);
        }

        return found[63];
    }

    private async findHashes(stretch = false): Promise<number> {
        return await this.runBatch(0, stretch, []);
    }

    private stretch(hash: string): string {
        for (let i = 0; i < 2016; i++) {
            hash = Md5.hashAsciiStr(hash) as string;
        }
        return hash;
    }

    async part1(): Promise<number> {
        return await this.findHashes();
    }

    async part2(): Promise<number> {
        return await this.findHashes(true);
    }
}