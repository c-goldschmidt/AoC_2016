import { STATUS_CODES } from "http";
import { parseJsonText } from "typescript";
import { Color, Dict, textColored } from "../utils";
import { Day } from "./day";

class ClusterNode {
    public static parse(line: string): ClusterNode | null {
        const match = /node-x(?<x>\d+)-y(?<y>\d+)\s+(?<total>\d+)T\s+(?<used>\d+)T\s+(?<avail>\d+)/.exec(line);
        if (!match) {
            return null;
        }
        return new ClusterNode(
            [parseInt(match.groups!.x, 10), parseInt(match.groups!.y, 10)],
            parseInt(match.groups!.total, 10),
            parseInt(match.groups!.used, 10),
            parseInt(match.groups!.avail, 10),
        );
    }

    public connections: ClusterNode[] = [];
    public containsTargetData = false;
    public initTargetData = false;

    private initUsed: number;
    private initAvail: number;

    constructor(public position: [number, number], public total: number, public used: number, public avail: number ) {
        this.initUsed = used;
        this.initAvail = avail;
     }

    public get hash() {
        return `${this.position[0]},${this.position[1]}`
    }

    public reset() {
        this.used = this.initUsed;
        this.avail = this.initAvail;
        this.containsTargetData = this.initTargetData;
    }

    public dist(other: [number, number]) {
        return Math.abs(this.position[0] - other[0]) + Math.abs(this.position[1] - other[1]);
    }

    public next() {
        // only moving empty node, so current node is expected to be empty.
        const possible = [];
        for (const conn of this.connections) {
            if (this.total >= conn.used && !conn.containsTargetData) {
                possible.push(conn);
            }
        }
        return possible;
    }

    public nextPossible() {
        const possible = [];
        for (const conn of this.connections) {
            if (this.used <= conn.avail && !conn.containsTargetData) {
                possible.push(conn);
            }
        }
        return possible;

    }

    public connect(nodes: ClusterNode[]) {
        for (const other of nodes) {
            if (this.dist(other.position) === 1) {
                this.connections.push(other);
            }
        }
    }

    public moveTo(target: ClusterNode) {
        if (target.used + this.used > target.total) {
            throw new Error('invalid move, target node lacks capacity');
        }

        target.used += this.used;
        target.avail -= this.used;
        this.avail += this.used;
        this.used = 0;

        if (this.containsTargetData) {
            this.containsTargetData = false;
            target.containsTargetData = true;
        }
    }
}

export class Day22 extends Day {
    part1(): number {
        const nodes = this.fileContent.map(line => ClusterNode.parse(line)).filter(node => !!node) as ClusterNode[];
        return this.getViableNodes(nodes);
    }

    part2(): number {
        const nodes = this.fileContent.map(line => ClusterNode.parse(line)).filter(node => !!node) as ClusterNode[];
        nodes.forEach(node => node.connect(nodes));
        const maxX = Math.max(...nodes.map(node => node.position[0]));

        const nodeWithData = nodes.find(node => node.position[1] === 0 && node.position[0] === maxX)!;
        nodeWithData.containsTargetData = true;
        nodeWithData.initTargetData = true;

        // this.printEmptiableNodes(nodes);
        // this.printGrid(nodes);
        
        return this.solve(nodes);
    }

    private solve(nodes: ClusterNode[]): number {
        let current = nodes.find(node => node.containsTargetData)!;
        let totalMoves = 0;
        while (current.position[0] > 0 || current.position[1] > 0) {
            const toEmpty = nodes.find(node => node.position[1] === 0 && node.position[0] === current.position[0] - 1)!
            let path = this.getMovesToEmptyNode(toEmpty, nodes.find(node => node.used === 0)!);

            if (totalMoves === 0) {
                this.printPath(nodes, path);
            }
            
            this.executeMove(path);
            totalMoves += path.length;
            
            current.moveTo(toEmpty);
            current = toEmpty;
            totalMoves += 1;
        }
        
        return totalMoves;
    }

    private printPath(nodes: ClusterNode[], path: ClusterNode[]) {
        console.log('================================================================');
        const result = this.getGrid(nodes);
        for (const node of path) {
            if (node.used === 0) {
                result[node.position[0]][node.position[1]] = textColored('E', Color.Green);
            } else {
                result[node.position[0]][node.position[1]] = textColored('O', Color.Yellow);
            }

        }
        console.log(result.map(x => x.join('')).join('\n'));
    }

    private executeMove(path: ClusterNode[]) {
        let prev = path.shift()!;
        for (const node of path) {
            node.moveTo(prev);
            prev = node;
        }
    }

    private getGrid(nodes: ClusterNode[]) {
        const result: string[][] = [];
        for (const node of nodes) {
            if (result.length <= node.position[0]) {
                result.push([]);
            }

            let text = '.';
            if (node.used > 400) {
                text = textColored('#', Color.Blue);
            } else if (node.containsTargetData) {
                text = textColored('G', Color.Red);
            }

            result[node.position[0]].push(text);
        }
        return result;
    }
    
    // A*
    private getMovesToEmptyNode(start: ClusterNode, empty: ClusterNode) {
        const prev: Dict<ClusterNode> = {};
        const gScore: Dict<number> = {};
        const fScore: Dict<number> = {};
        const queue: ClusterNode[] = [start];

        gScore[start.hash] = 0;
        fScore[start.hash] = start.dist(empty.position);

        while (queue.length > 0) {
            const current = queue.reduce((acc, curr) => {
                return (!acc || fScore[acc.hash] > fScore[curr.hash]) ? curr : acc;
            }, null as ClusterNode | null);

            if (!current) {
                throw new Error('no current node');
            }

            if (current.dist(empty.position) === 0) {
                const path = [];
                let prevNode = current;
                while (prevNode !== start) {
                    path.push(prevNode);
                    prevNode = prev[prevNode.hash];
                }
                path.push(prevNode);
                return path;
            }

            queue.splice(queue.indexOf(current), 1);
            for (const next of current.next()) {
                const nextGScore = gScore[current.hash] + 1;
                if (!gScore[next.hash] || nextGScore < gScore[next.hash]) {
                    prev[next.hash] = current;
                    gScore[next.hash] = nextGScore;
                    fScore[next.hash] = gScore[next.hash] + next.dist(empty.position);

                    if (!queue.includes(next)) {
                        queue.push(next);
                    }
                }
            }
        }

        throw new Error('no path found');
    }

    private getViableNodes(nodes: ClusterNode[]) {
        let viable = 0;
        for(const node of nodes) {
            if (node.used === 0) {
                continue;
            }

            for(const other of nodes) {
                if (other === node) {
                    continue;
                }
                viable += node.used <= other.avail ? 1 : 0;
            }
        }
        return viable;
    }
}