export interface Index<T> {
    [index: number]: T;
}

export interface Dict<T> {
    [index: string]: T;
}

export function dec2bin(dec: number): string {
    return (dec >>> 0).toString(2);
}


export enum Color {
    Reset = "\x1b[0m",
    Black = "\x1b[30m",
    Red = "\x1b[31m",
    Green = "\x1b[32m",
    Yellow = "\x1b[33m",
    Blue = "\x1b[34m",
    Magenta = "\x1b[35m",
    Cyan = "\x1b[36m",
    White = "\x1b[37m",
}

export function textColored(text: string, color: Color) {
    return `${color}${text}${Color.Reset}`

}