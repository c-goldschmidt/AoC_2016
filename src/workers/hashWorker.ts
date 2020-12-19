import { Md5 } from "ts-md5";
import { parentPort } from "worker_threads"

function stretchHash(hash: string): string {
    for (let i = 0; i < 2016; i++) {
        hash = Md5.hashAsciiStr(hash) as string;
    }
    return hash;
}

function isHashValid(key: string, i: number, search: string, stretch: boolean) {
    for (let j = 1; j <= 1000; j++) {
        let subhash = Md5.hashAsciiStr(key + (i + j)) as string;
        if (stretch) {
            subhash = stretchHash(subhash);
        }
        if (subhash.includes(search.repeat(5))) {
            return true;
        }
    }
}

parentPort!.on('message', (msg) => {
    const { id, data } = msg;
    const { key, i, search, stretch } = data;

    if (isHashValid(key, i, search, stretch)) {
        parentPort!.postMessage({ id, result: i })
    } else {
        parentPort!.postMessage({ id, result: null })
    }
})