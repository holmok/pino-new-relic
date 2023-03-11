import { PinoNewRelicOptions } from '.';
export declare class Accumulator {
    private readonly options;
    private readonly _list;
    private readonly _timer;
    private readonly _transport;
    constructor(options: PinoNewRelicOptions);
    add(input: any): void;
    private flush;
    close(): Promise<void>;
}
