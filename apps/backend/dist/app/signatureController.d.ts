import { Request, Response } from 'express';
export declare class SignatureController {
    private signatureService;
    constructor();
    generateSignature(req: Request, res: Response): Promise<void>;
    getTemplates(req: Request, res: Response): Promise<void>;
    getTemplateById(req: Request, res: Response): Promise<void>;
}
