import { listenerCount } from "process";

export function permutatons<T>(inputArr: T[], maxLen?: number, includeSmaller = false): T[][] {
    let result: T[][] = [];
    maxLen = maxLen || inputArr.length;

    const permute = (arr: T[], m: T[]) => {
        if (includeSmaller && m.length < maxLen!) {
            result.push(m);
        }

        if (m.length === maxLen! || arr.length === 0) {
            result.push(m);
            return;
        }

        for (let i = 0; i < arr.length; i++) {
            let curr = arr.slice();
            let next = curr.splice(i, 1);
            permute(curr.slice(), m.concat(next))
        }
    }

    permute(inputArr, [])
    return result;
  }