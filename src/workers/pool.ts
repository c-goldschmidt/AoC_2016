import { Worker } from 'worker_threads';

type Callback<T, R=void> = (data: T) => R;

interface BacklogEntry<T, R = void> {
    id: number;
    task: Callback<T, R>;
    data: T;
}

export class WorkerPool {
    private taskIdCounter = 0;
    private backlog: BacklogEntry<any, any>[] = [];
    private resolvers = new Map<number, Callback<any, void>>();
    private idle: number[];
    private workers: Map<number, Worker>;

    constructor(poolSize: number, workerScript: string) {
        this.workers = new Map(Array.from({length: poolSize}).map(() => {
            const worker = new Worker(workerScript);
            worker.on('message', data => {
                this.resolve(data, worker.threadId);
            });
            return [worker.threadId, worker];
        }));
        this.idle = Array.from(this.workers.keys());
    }
    
    public run<T, R>(data: T): Promise<R> {
        const taskId = this.taskIdCounter++;
        this.backlog.push({id: taskId, data} as BacklogEntry<T, R>);

        const prom = new Promise<R>(r => this.resolvers.set(taskId, r));
        this.runNext();
        return prom;
    }

    public async sync() {
        while (this.resolvers.size > 0) {
            await new Promise((resolve) => {setTimeout(resolve, 100)});
        }
    }

    public async syncAndStop() {
        await this.sync();
        this.stop();
    }

    public stop() {
        this.workers.forEach((worker) => {
            worker.terminate();
        });
    }

    private resolve(msg: any, workerId: number) {
        let {id, result} = msg;
        id = parseInt(id, 10);

        this.resolvers.get(id)!(result);
        this.resolvers.delete(id);
        this.idle.push(workerId);
        this.runNext();
    }

    private runNext() {
        if (this.backlog.length === 0 || this.idle.length === 0) {
            return;
        }

        const task = this.backlog.shift()!;
        const worker =  this.idle.shift()!;
        const msg = {...task};

        this.workers.get(worker)!.postMessage(msg);
        this.runNext();
    }

}
