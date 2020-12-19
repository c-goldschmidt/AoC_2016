export interface Index<T> {
    [index: number]: T;
}

export interface Dict<T> {
    [index: string]: T;
}

export function dec2bin(dec: number): string {
    return (dec >>> 0).toString(2);
}