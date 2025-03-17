import { Queue } from 'bull';
export declare class Producer {
    private queue;
    constructor(queue: Queue);
    sendSignatureRequest(data: string, webhookUrl?: string): Promise<void>;
    sendMessage(message: {
        type: string;
        payload: any;
    }): Promise<void>;
}
