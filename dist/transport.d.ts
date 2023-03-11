import { PinoNewRelicOptions } from '.';
export declare class Transport {
    private readonly options;
    private readonly sending;
    private readonly axios;
    constructor(options: PinoNewRelicOptions);
    send(input: any[]): Promise<void>;
    close(): Promise<void>;
}
