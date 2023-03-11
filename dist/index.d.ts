#!/usr/bin/env node
export interface PinoNewRelicCLiOptions {
    dryRun?: boolean;
    apiKey?: string;
    intervalMs?: number;
    maxLines?: number;
    eu?: boolean;
    echoOn?: boolean;
    gzip?: boolean;
}
export interface PinoNewRelicOptions {
    dryRun: boolean;
    apiKey: string;
    intervalMs: number;
    maxLines: number;
    eu: boolean;
    echoOn: boolean;
    gzip: boolean;
}
export declare function run(): void;
