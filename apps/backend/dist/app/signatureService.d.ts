import { UserData, SignatureResponse } from '../types.js';
declare enum TemplateType {
    HTML = "HTML",
    TEXT = "TEXT"
}
export declare class SignatureService {
    private producer;
    private redisClient;
    constructor();
    generateSignature(templateId: string, userData: UserData, signatureType: TemplateType, webhookUrl?: string): Promise<SignatureResponse>;
    generateSignatureBatch(templateId: string, usersData: UserData[], signatureType: TemplateType, webhookUrl?: string): Promise<void>;
    private sendToWebhook;
}
export {};
